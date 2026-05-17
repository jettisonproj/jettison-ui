import { useContext } from "react";

import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  FlowGraphLoading,
  FlowGraphNode,
  FlowGraphNodeInfo,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import {
  ArgoCDDriftBadge,
  ArgoCDFailingBadge,
  ArgoCDLiveBadge,
  ArgoCDNotFoundBadge,
  ArgoCDPausedBadge,
} from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDBadge.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import { RolloutPhases } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  ApplicationsContext,
  RolloutsContext,
} from "src/providers/provider.tsx";
import { getStepDetailsLink } from "src/utils/flowUtil.ts";
import { getDisplayRepoPath, getRepoPathLink } from "src/utils/gitUtil.ts";
import type { WorkflowNode } from "src/utils/workflowUtil.ts";
import {
  getLastWorkflowNodeForStep,
  getWorkflowRevision,
} from "src/utils/workflowUtil.ts";

const SYNCED_STATUS = "Synced";
const HEALTHY_STATUS = "Healthy";
const APP_VERSION_LABEL = "app.kubernetes.io/version";

interface FlowGraphArgoCDStepProps {
  repoOrg: string;
  repoName: string;
  step: ArgoCDStep;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphArgoCDStep({
  repoOrg,
  repoName,
  step,
  isPrFlow,
  workflows,
}: FlowGraphArgoCDStepProps) {
  const { repoUrl, repoPath, baseRef } = step;
  const displayRepoPath = getDisplayRepoPath(repoPath, repoPath);
  const stepDetailsLink = getStepDetailsLink(repoOrg, repoName, isPrFlow, step);
  const repoLink = getRepoPathLink(repoUrl, baseRef, repoPath);
  const workflowNode = getLastWorkflowNodeForStep(step, workflows);
  return (
    <FlowGraphNode
      headerClass={styles.nodeRowHeader}
      headerLink={stepDetailsLink}
      titleIcon={`nf nf-md-kubernetes ${styles.k8sIcon}`}
      titleText={displayRepoPath}
    >
      {workflowNode == null && <FlowGraphLoading />}
      {workflowNode != null && (
        <FlowGraphNodeInfo isPrFlow={isPrFlow} workflowNode={workflowNode} />
      )}
      <div className={styles.nodeDivider} />
      <a
        className={styles.nodeRowLink}
        href={repoLink}
        target="_blank"
        rel="noreferrer"
      >
        <i className={`nf nf-fa-layer_group ${styles.infraIcon}`} />
        <span className={styles.nodeTextSub}>Infrastructure</span>
      </a>
      <FlowGraphArgoCDStepStatus
        step={step}
        stepDetailsLink={stepDetailsLink}
        workflowNode={workflowNode}
      />
    </FlowGraphNode>
  );
}

interface FlowGraphArgoCDStepStatusProps {
  step: ArgoCDStep;
  stepDetailsLink: string;
  workflowNode: WorkflowNode | null;
}
function FlowGraphArgoCDStepStatus({
  step,
  stepDetailsLink,
  workflowNode,
}: FlowGraphArgoCDStepStatusProps) {
  //
  // The UI will present the rollout and sync state separately
  // Here are the different cases:
  //
  // Case                                    | Rollout State | Sync State
  // -----------------------------------------------------------
  // application not loaded                  | Loading       | None
  // rollout not loaded                      | Loading       | None
  // application does not exist              | Not Found     | None
  // rollout does not exist                  | Not Found     | None
  //
  // application health status bad           | Failing       | None
  // rollout status bad                      | Failing       | None
  // flow step is paused                     | None          | Paused
  // application sync status bad             | None          | Drift
  // multiple rollouts different versions    | None          | Drift
  // rollout version doesn't match workflow  | None          | Drift
  //
  const { repoUrl, repoPath } = step;
  const applications = useContext(ApplicationsContext);
  const rollouts = useContext(RolloutsContext);

  if (applications == null || rollouts == null) {
    return (
      <div className={styles.nodeRowBlock}>
        <LoadIcon />
      </div>
    );
  }

  const application = applications.get(repoUrl)?.get(repoPath);
  if (application == null) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDNotFoundBadge stepDetailsLink={stepDetailsLink} />
      </div>
    );
  }

  let applicationHealthError;
  let applicationSyncError;

  let rolloutHealthError;
  let rolloutSyncError;

  let expectedRolloutVersion;
  let rolloutMissing = false;

  if (workflowNode != null) {
    expectedRolloutVersion = getWorkflowRevision(
      workflowNode.workflow.memo.parameterMap,
    );
  }

  const { enabled: autoSyncEnabled } = application.spec.syncPolicy.automated;
  const { status: healthStatus } = application.status.health;
  const { status: syncStatus } = application.status.sync;
  if (healthStatus !== HEALTHY_STATUS) {
    applicationHealthError = `ArgoCD health status is ${healthStatus}`;
  } else if (syncStatus !== SYNCED_STATUS) {
    applicationSyncError = `ArgoCD sync status is ${syncStatus}`;
  }

  for (const resource of application.status.resources) {
    if (resource.kind === ResourceKinds.Rollout) {
      const { namespace, name } = resource;
      const rollout = rollouts.get(namespace)?.get(name);
      if (rollout == null) {
        rolloutMissing = true;
        continue;
      }
      if (
        rollout.status.phase !== RolloutPhases.Healthy &&
        rollout.status.phase !== RolloutPhases.Paused
      ) {
        rolloutHealthError = `Rollout status is ${rollout.status.phase}`;
      }
      const rolloutVersion = rollout.metadata.labels?.[APP_VERSION_LABEL];
      if (!rolloutVersion) {
        rolloutSyncError = "Rollout is missing version label";
      } else if (
        expectedRolloutVersion != null &&
        expectedRolloutVersion !== rolloutVersion
      ) {
        rolloutSyncError = "Rollout versions are inconsistent";
      }

      expectedRolloutVersion ??= rolloutVersion;
    }
  }

  return (
    <div className={styles.nodeRowBlock}>
      <FlowGraphArgoCDHealthBadge
        stepDetailsLink={stepDetailsLink}
        applicationHealthError={applicationHealthError}
        rolloutHealthError={rolloutHealthError}
        rolloutMissing={rolloutMissing}
      />
      <FlowGraphArgoCDSyncBadge
        stepDetailsLink={stepDetailsLink}
        applicationSyncError={applicationSyncError}
        rolloutSyncError={rolloutSyncError}
        pausedReason={step.pausedReason}
        autoSyncEnabled={autoSyncEnabled}
      />
    </div>
  );
}

interface FlowGraphArgoCDHealthBadgeProps {
  stepDetailsLink: string;
  applicationHealthError?: string;
  rolloutHealthError?: string;
  rolloutMissing: boolean;
}
function FlowGraphArgoCDHealthBadge({
  stepDetailsLink,
  applicationHealthError,
  rolloutHealthError,
  rolloutMissing,
}: FlowGraphArgoCDHealthBadgeProps) {
  if (rolloutHealthError != null) {
    return (
      <ArgoCDFailingBadge
        stepDetailsLink={stepDetailsLink}
        title={rolloutHealthError}
      />
    );
  }
  if (applicationHealthError != null) {
    return (
      <ArgoCDFailingBadge
        stepDetailsLink={stepDetailsLink}
        title={applicationHealthError}
      />
    );
  }
  if (rolloutMissing) {
    return <ArgoCDNotFoundBadge stepDetailsLink={stepDetailsLink} />;
  }
  return <ArgoCDLiveBadge stepDetailsLink={stepDetailsLink} />;
}

interface FlowGraphArgoCDSyncBadgeProps {
  stepDetailsLink: string;
  applicationSyncError?: string;
  rolloutSyncError?: string;
  pausedReason?: string;
  autoSyncEnabled: boolean;
}
function FlowGraphArgoCDSyncBadge({
  stepDetailsLink,
  applicationSyncError,
  rolloutSyncError,
  pausedReason,
  autoSyncEnabled,
}: FlowGraphArgoCDSyncBadgeProps) {
  if (!autoSyncEnabled) {
    return (
      <ArgoCDPausedBadge
        stepDetailsLink={stepDetailsLink}
        title={pausedReason}
      />
    );
  }
  if (applicationSyncError != null) {
    return (
      <ArgoCDDriftBadge
        stepDetailsLink={stepDetailsLink}
        title={applicationSyncError}
      />
    );
  }
  if (rolloutSyncError != null) {
    return (
      <ArgoCDDriftBadge
        stepDetailsLink={stepDetailsLink}
        title={rolloutSyncError}
      />
    );
  }
  return null;
}

export { FlowGraphArgoCDStep };
