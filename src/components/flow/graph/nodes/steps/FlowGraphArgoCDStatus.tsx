import type { JSX } from "react";
import { useContext } from "react";

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
import {
  ApplicationsContext,
  RolloutsContext,
} from "src/providers/provider.tsx";
import { getRolloutResource } from "src/utils/applicationUtil.ts";
import { APP_VERSION_LABEL } from "src/utils/resourceUtil.ts";
import type { WorkflowNode } from "src/utils/workflowUtil.ts";
import { getWorkflowRevision } from "src/utils/workflowUtil.ts";

interface FlowGraphArgoCDStatusProps {
  step: ArgoCDStep;
  stepDetailsLink: string;
  workflowNode: WorkflowNode | null;
}
function FlowGraphArgoCDStatus({
  step,
  stepDetailsLink,
  workflowNode,
}: FlowGraphArgoCDStatusProps): JSX.Element {
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
    return <LoadIcon />;
  }

  const application = applications.get(repoUrl)?.get(repoPath);
  if (application == null) {
    return (
      <ArgoCDNotFoundBadge
        stepDetailsLink={stepDetailsLink}
        title={"Application not found"}
      />
    );
  }

  const rolloutResource = getRolloutResource(application);
  if (rolloutResource == null) {
    return (
      <ArgoCDNotFoundBadge
        stepDetailsLink={stepDetailsLink}
        title={"Application rollout not found"}
      />
    );
  }

  const rollout = rollouts
    .get(rolloutResource.namespace)
    ?.get(rolloutResource.name);
  if (rollout == null) {
    return (
      <ArgoCDNotFoundBadge
        stepDetailsLink={stepDetailsLink}
        title={"Rollout not found"}
      />
    );
  }

  const applicationHealthStatus = application.status.health.status;
  if (applicationHealthStatus === HealthStatusCodes.Missing) {
    return (
      <ArgoCDNotFoundBadge
        stepDetailsLink={stepDetailsLink}
        title={"Application resource is missing"}
      />
    );
  }

  const rolloutPhase = rollout.status.phase;
  if (rolloutPhase === RolloutPhases.Degraded) {
    return (
      <ArgoCDFailingBadge
        stepDetailsLink={stepDetailsLink}
        title={`Rollout is ${RolloutPhases.Degraded}`}
      />
    );
  }

  if (applicationHealthStatus === HealthStatusCodes.Degraded) {
    return (
      <ArgoCDFailingBadge
        stepDetailsLink={stepDetailsLink}
        title={`Application health status is ${HealthStatusCodes.Degraded}`}
      />
    );
  }

  const applicationSyncStatus = application.status.sync.status;
  if (applicationSyncStatus === SyncStatusCodes.OutOfSync) {
    return (
      <ArgoCDDriftBadge
        stepDetailsLink={stepDetailsLink}
        title={`Application sync status is ${SyncStatusCodes.OutOfSync}`}
      />
    );
  }

  const rolloutVersion = rollout.metadata.labels?.[APP_VERSION_LABEL];
  if (rolloutVersion == null) {
    return (
      <ArgoCDDriftBadge
        stepDetailsLink={stepDetailsLink}
        title={`Rollout version label is missing: ${APP_VERSION_LABEL}`}
      />
    );
  }

  if (workflowNode != null) {
    const expectedRolloutVersion = getWorkflowRevision(
      workflowNode.workflow.memo.parameterMap,
    );
    if (expectedRolloutVersion !== rolloutVersion) {
      return (
        <ArgoCDDriftBadge
          stepDetailsLink={stepDetailsLink}
          title={`Expected version ${expectedRolloutVersion} but got ${rolloutVersion}`}
        />
      );
    }
  }

  const { enabled: autoSyncEnabled } = application.spec.syncPolicy.automated;
  if (!autoSyncEnabled) {
    return (
      <ArgoCDPausedBadge
        stepDetailsLink={stepDetailsLink}
        title={`Pause Reason: ${String(step.pausedReason)}`}
      />
    );
  }

  if (applicationHealthStatus === HealthStatusCodes.Unknown) {
    return (
      <ArgoCDUnknownBadge
        stepDetailsLink={stepDetailsLink}
        title={`Application health status is ${HealthStatusCodes.Unknown}`}
      />
    );
  }

  if (applicationSyncStatus === SyncStatusCodes.Unknown) {
    return (
      <ArgoCDUnknownBadge
        stepDetailsLink={stepDetailsLink}
        title={`Application sync status is ${SyncStatusCodes.Unknown}`}
      />
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (applicationSyncStatus !== SyncStatusCodes.Synced) {
    applicationSyncStatus satisfies never;
    console.log("unknown sync status");
    console.log(applicationSyncStatus);
    throw new FlowGraphArgoCDStatusError("invalid sync status");
  }

  if (
    rolloutPhase === RolloutPhases.Healthy &&
    applicationHealthStatus === HealthStatusCodes.Healthy
  ) {
    return <ArgoCDLiveBadge stepDetailsLink={stepDetailsLink} />;
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
    throw new FlowGraphArgoCDStatusError("invalid rollout phase");
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
    throw new FlowGraphArgoCDStatusError("invalid application health status");
  }

  return (
    <ArgoCDDeployingBadge
      stepDetailsLink={stepDetailsLink}
      title={`Rollout ${rolloutPhase}, Application ${applicationHealthStatus}`}
    />
  );
}

class FlowGraphArgoCDStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowGraphArgoCDStatus };
