import type { JSX } from "react";
import { useContext } from "react";

import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  FlowGraphLoading,
  FlowGraphNode,
  FlowGraphNodeInfo,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import {
  ArgoCDDeployingBadge,
  ArgoCDDriftBadge,
  ArgoCDFailingBadge,
  ArgoCDLiveBadge,
  ArgoCDNotFoundBadge,
  ArgoCDPausedBadge,
  ArgoCDUnknownBadge,
} from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDBadge.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import {
  HealthStatusCodes,
  SyncStatusCodes,
} from "src/data/types/applicationTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import { RolloutPhases } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  ApplicationsContext,
  RolloutsContext,
} from "src/providers/provider.tsx";
import { getRolloutResource } from "src/utils/applicationUtil.ts";
import { getStepDetailsLink } from "src/utils/flowUtil.ts";
import { getDisplayRepoPath, getRepoPathLink } from "src/utils/gitUtil.ts";
import { APP_VERSION_LABEL } from "src/utils/resourceUtil.ts";
import type { WorkflowNode } from "src/utils/workflowUtil.ts";
import {
  getLastWorkflowNodeForStep,
  getWorkflowRevision,
} from "src/utils/workflowUtil.ts";

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
}: FlowGraphArgoCDStepProps): JSX.Element {
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
}: FlowGraphArgoCDStepStatusProps): JSX.Element {
  //
  // The UI presents a combined status, surfacing the most relevant status
  // across different resources (e.g. Rollout and Application) and fields
  // (e.g. sync and health statuses)
  //
  // Here are the different cases:
  //
  // Case                                    | Final State
  // -----------------------------------------------------------
  // application or rollout not loaded       | Loading
  // application not found                   | Not Found
  // application rollout not found           | Not Found
  // rollout does not exist                  | Not Found
  // application resource missing            | Not Found
  // rollout status degraded                 | Failing
  // application health status degraded      | Failing
  // application out of sync                 | Drift
  // rollout version missing                 | Drift
  // rollout version mismatch                | Drift
  // application sync disabled               | Paused
  // application health status unknown       | Unknown
  // application sync status unknown         | Unknown
  // application and rollout healthy         | Live
  // application and rollout deploying       | Deploying
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
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={"Application not found"}
        />
      </div>
    );
  }

  const rolloutResource = getRolloutResource(application);
  if (rolloutResource == null) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={"Application rollout not found"}
        />
      </div>
    );
  }

  const rollout = rollouts
    .get(rolloutResource.namespace)
    ?.get(rolloutResource.name);
  if (rollout == null) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={"Rollout not found"}
        />
      </div>
    );
  }

  const applicationHealthStatus = application.status.health.status;
  if (applicationHealthStatus === HealthStatusCodes.Missing) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={"Application resource is missing"}
        />
      </div>
    );
  }

  const rolloutPhase = rollout.status.phase;
  if (rolloutPhase === RolloutPhases.Degraded) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDFailingBadge
          stepDetailsLink={stepDetailsLink}
          title={`Rollout is ${RolloutPhases.Degraded}`}
        />
      </div>
    );
  }

  if (applicationHealthStatus === HealthStatusCodes.Degraded) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDFailingBadge
          stepDetailsLink={stepDetailsLink}
          title={`Application health status is ${HealthStatusCodes.Degraded}`}
        />
      </div>
    );
  }

  const applicationSyncStatus = application.status.sync.status;
  if (applicationSyncStatus === SyncStatusCodes.OutOfSync) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDDriftBadge
          stepDetailsLink={stepDetailsLink}
          title={`Application sync status is ${SyncStatusCodes.OutOfSync}`}
        />
      </div>
    );
  }

  const rolloutVersion = rollout.metadata.labels?.[APP_VERSION_LABEL];
  if (rolloutVersion == null) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDDriftBadge
          stepDetailsLink={stepDetailsLink}
          title={`Rollout version label is missing: ${APP_VERSION_LABEL}`}
        />
      </div>
    );
  }

  if (workflowNode != null) {
    const expectedRolloutVersion = getWorkflowRevision(
      workflowNode.workflow.memo.parameterMap,
    );
    if (expectedRolloutVersion !== rolloutVersion) {
      return (
        <div className={styles.nodeRowBlock}>
          <ArgoCDDriftBadge
            stepDetailsLink={stepDetailsLink}
            title={`Expected version ${expectedRolloutVersion} but got ${rolloutVersion}`}
          />
        </div>
      );
    }
  }

  const { enabled: autoSyncEnabled } = application.spec.syncPolicy.automated;
  if (!autoSyncEnabled) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDPausedBadge
          stepDetailsLink={stepDetailsLink}
          title={`Pause Reason: ${String(step.pausedReason)}`}
        />
      </div>
    );
  }

  if (applicationHealthStatus === HealthStatusCodes.Unknown) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDUnknownBadge
          stepDetailsLink={stepDetailsLink}
          title={`Application health status is ${HealthStatusCodes.Unknown}`}
        />
      </div>
    );
  }

  if (applicationSyncStatus === SyncStatusCodes.Unknown) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDUnknownBadge
          stepDetailsLink={stepDetailsLink}
          title={`Application sync status is ${SyncStatusCodes.Unknown}`}
        />
      </div>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (applicationSyncStatus !== SyncStatusCodes.Synced) {
    applicationSyncStatus satisfies never;
    console.log("unknown sync status");
    console.log(applicationSyncStatus);
    throw new FlowGraphArgoCDStepError("invalid sync status");
  }

  if (
    rolloutPhase === RolloutPhases.Healthy &&
    applicationHealthStatus === HealthStatusCodes.Healthy
  ) {
    return (
      <div className={styles.nodeRowBlock}>
        <ArgoCDLiveBadge stepDetailsLink={stepDetailsLink} />
      </div>
    );
  }

  if (
    rolloutPhase !== RolloutPhases.Healthy &&
    rolloutPhase !== RolloutPhases.Progressing &&
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    rolloutPhase !== RolloutPhases.Paused
  ) {
    // The "Paused" / "Suspended" statuses are currently expected to be temporary,
    // so it is still considered to be deploying
    rolloutPhase satisfies never;
    console.log("unknown rollout phase");
    console.log(rolloutPhase);
    throw new FlowGraphArgoCDStepError("invalid rollout phase");
  }

  if (
    applicationHealthStatus !== HealthStatusCodes.Healthy &&
    applicationHealthStatus !== HealthStatusCodes.Progressing &&
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    applicationHealthStatus !== HealthStatusCodes.Suspended
  ) {
    // The "Paused" / "Suspended" statuses are currently expected to be temporary,
    // so it is still considered to be deploying
    applicationHealthStatus satisfies never;
    console.log("unknown application health status");
    console.log(applicationHealthStatus);
    throw new FlowGraphArgoCDStepError("invalid application health status");
  }

  return (
    <div className={styles.nodeRowBlock}>
      <ArgoCDDeployingBadge
        stepDetailsLink={stepDetailsLink}
        title={`Rollout ${rolloutPhase}, Application ${applicationHealthStatus}`}
      />
    </div>
  );
}

class FlowGraphArgoCDStepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowGraphArgoCDStep };
