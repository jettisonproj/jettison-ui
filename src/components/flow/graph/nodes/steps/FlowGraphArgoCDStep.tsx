import { useContext } from "react";

import {
  ApplicationsContext,
  RolloutsContext,
} from "src/providers/provider.tsx";
import { getRepoPathLink } from "src/utils/gitUtil.ts";
import {
  FlowGraphNode,
  FlowGraphLoading,
  FlowGraphTimestamp,
  FlowGraphCommit,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  getDisplayRepoPath,
  getStepDetailsLink,
  getLastWorkflowNodeForStep,
} from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import { getWorkflowRevision } from "src/utils/workflowUtil.ts";
import type { WorkflowNode } from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import { ResourceKind } from "src/data/types/baseResourceTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";

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
      headerLink={stepDetailsLink}
      titleIcon={`nf nf-md-kubernetes ${styles.k8sIcon}`}
      titleText={displayRepoPath}
    >
      {workflowNode == null && <FlowGraphLoading />}
      {workflowNode != null && (
        <>
          <FlowGraphCommit
            isPrFlow={isPrFlow}
            workflow={workflowNode.workflow}
          />
          <FlowGraphTimestamp node={workflowNode.node} />
        </>
      )}
      <a
        className={styles.nodeRowLink}
        href={repoLink}
        target="_blank"
        rel="noreferrer"
      >
        <i className={`nf nf-fa-layer_group ${styles.infraIcon}`} />
        <span className={styles.nodeText}>Infrastructure</span>
      </a>
      <FlowGraphArgoCDStepStatus step={step} workflowNode={workflowNode} />
    </FlowGraphNode>
  );
}

interface FlowGraphArgoCDStepStatusProps {
  step: ArgoCDStep;
  workflowNode: WorkflowNode | null;
}
function FlowGraphArgoCDStepStatus({
  step,
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
  // application sync status bad             | None          | Drift
  // multiple rollouts different versions    | None          | Drift
  // rollout version doesn't match workflow  | None          | Drift
  //
  const { repoUrl, repoPath } = step;
  const applications = useContext(ApplicationsContext);
  const rollouts = useContext(RolloutsContext);

  if (applications == null || rollouts == null) {
    return (
      <div className={styles.nodeRowText}>
        <LoadIcon />
      </div>
    );
  }

  const application = applications.get(repoUrl)?.get(repoPath);
  if (application == null) {
    return (
      <div className={styles.nodeRowText}>
        <div className={styles.notFoundBadge}>Not Found</div>
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

  const { status: healthStatus } = application.status.health;
  const { status: syncStatus } = application.status.sync;
  if (healthStatus !== HEALTHY_STATUS) {
    applicationHealthError = `ArgoCD health status is ${healthStatus}`;
  } else if (syncStatus !== SYNCED_STATUS) {
    applicationSyncError = `ArgoCD sync status is ${syncStatus}`;
  }

  for (const resource of application.status.resources) {
    if (resource.kind === ResourceKind.Rollout.valueOf()) {
      const { namespace, name } = resource;
      const rollout = rollouts.get(namespace)?.get(name);
      if (rollout == null) {
        rolloutMissing = true;
        continue;
      }
      if (rollout.status.phase !== HEALTHY_STATUS) {
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
      if (expectedRolloutVersion == null) {
        expectedRolloutVersion = rolloutVersion;
      }
    }
  }

  return (
    <div className={styles.nodeRowText}>
      <FlowGraphArgoCDHealthBadge
        applicationHealthError={applicationHealthError}
        rolloutHealthError={rolloutHealthError}
        rolloutMissing={rolloutMissing}
      />
      <FlowGraphArgoCDSyncBadge
        applicationSyncError={applicationSyncError}
        rolloutSyncError={rolloutSyncError}
      />
    </div>
  );
}

interface FlowGraphArgoCDHealthBadgeProps {
  applicationHealthError?: string;
  rolloutHealthError?: string;
  rolloutMissing: boolean;
}
function FlowGraphArgoCDHealthBadge({
  applicationHealthError,
  rolloutHealthError,
  rolloutMissing,
}: FlowGraphArgoCDHealthBadgeProps) {
  if (rolloutHealthError != null) {
    return (
      <div className={styles.failingBadge} title={rolloutHealthError}>
        Failing
      </div>
    );
  }
  if (applicationHealthError != null) {
    return (
      <div className={styles.failingBadge} title={applicationHealthError}>
        Failing
      </div>
    );
  }
  if (rolloutMissing) {
    return <div className={styles.notFoundBadge}>Not Found</div>;
  }
  return <div className={styles.liveBadge}>Live</div>;
}

interface FlowGraphArgoCDSyncBadgeProps {
  applicationSyncError?: string;
  rolloutSyncError?: string;
}
function FlowGraphArgoCDSyncBadge({
  applicationSyncError,
  rolloutSyncError,
}: FlowGraphArgoCDSyncBadgeProps) {
  if (applicationSyncError != null) {
    return (
      <div className={styles.driftBadge} title={applicationSyncError}>
        Drift
      </div>
    );
  }
  if (rolloutSyncError != null) {
    return (
      <div className={styles.driftBadge} title={rolloutSyncError}>
        Drift
      </div>
    );
  }
  return null;
}

export { FlowGraphArgoCDStep };
