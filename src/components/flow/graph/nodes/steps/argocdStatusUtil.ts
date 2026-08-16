import type { Application } from "src/data/types/applicationTypes.ts";
import {
  HealthStatusCodes,
  SyncStatusCodes,
} from "src/data/types/applicationTypes.ts";

import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import { RolloutPhases } from "src/data/types/rolloutTypes.ts";
import { getRolloutResource } from "src/utils/applicationUtil.ts";
import { APP_VERSION_LABEL } from "src/utils/resourceUtil.ts";
import type { WorkflowNode } from "src/utils/workflowUtil.ts";
import { getWorkflowRevision } from "src/utils/workflowUtil.ts";

//
// The UI presents a combined status, surfacing the most relevant status
// across different resources (e.g. Rollout and Application) and fields
// (e.g. sync and health statuses)
//
// Here are the different cases:
//
// Case                                    | Display Order | Final State
// ---------------------------------------------------------------------------
// application or rollout not loaded       | 00            | Loading
// application not found                   | 01            | Not Found
// application rollout not found           | 02            | Not Found
// rollout not found                       | 03            | Not Found
// application resource not found          | 04            | Not Found
// rollout status degraded                 | 05            | Failing
// application health status degraded      | 06            | Failing
// application out of sync                 | 07            | Drift
// rollout version not found               | 08            | Drift
// rollout version mismatch                | 09            | Drift
// application sync disabled               | 10            | Paused
// application health status unknown       | 11            | Unknown
// application sync status unknown         | 12            | Unknown
// application and rollout healthy         | 13            | Live
// application and rollout deploying       | 14            | Deploying
//
const ArgoCDStatuses = {
  Loading: 0,
  ApplicationNotFound: 1,
  ApplicationRolloutNotFound: 2,
  RolloutNotFound: 3,
  ApplicationResourceNotFound: 4,
  RolloutStatusDegraded: 5,
  ApplicationHealthDegraded: 6,
  ApplicationOutOfSync: 7,
  RolloutVersionNotFound: 8,
  RolloutVersionMismatch: 9,
  ApplicationSyncDisabled: 10,
  ApplicationHealthUnknown: 11,
  ApplicationSyncUnknown: 12,
  Healthy: 13,
  Deploying: 14,
} as const;

type ArgoCDStatus = (typeof ArgoCDStatuses)[keyof typeof ArgoCDStatuses];

interface ArgoCDStatusResponse {
  argocdStatus: ArgoCDStatus;
  argocdTitle: string;
}

function getArgoCDStatus(
  step: ArgoCDStep,
  workflowNode: WorkflowNode | null,
  applications: Map<string, Map<string, Application>> | null,
  rollouts: Map<string, Map<string, Rollout>> | null,
): ArgoCDStatusResponse {
  const { repoUrl, repoPath } = step;

  if (applications == null || rollouts == null) {
    return {
      argocdStatus: ArgoCDStatuses.Loading,
      argocdTitle: "Loading",
    };
  }

  const application = applications.get(repoUrl)?.get(repoPath);
  if (application == null) {
    return {
      argocdStatus: ArgoCDStatuses.ApplicationNotFound,
      argocdTitle: "Application not found",
    };
  }

  const rolloutResource = getRolloutResource(application);
  if (rolloutResource == null) {
    return {
      argocdStatus: ArgoCDStatuses.ApplicationRolloutNotFound,
      argocdTitle: "Application rollout not found",
    };
  }

  const rollout = rollouts
    .get(rolloutResource.namespace)
    ?.get(rolloutResource.name);
  if (rollout == null) {
    return {
      argocdStatus: ArgoCDStatuses.RolloutNotFound,
      argocdTitle: "Rollout not found",
    };
  }

  const applicationHealthStatus = application.status.health.status;
  if (applicationHealthStatus === HealthStatusCodes.Missing) {
    return {
      argocdStatus: ArgoCDStatuses.ApplicationResourceNotFound,
      argocdTitle: "Application resource is missing",
    };
  }

  const rolloutPhase = rollout.status.phase;
  if (rolloutPhase === RolloutPhases.Degraded) {
    return {
      argocdStatus: ArgoCDStatuses.RolloutStatusDegraded,
      argocdTitle: `Rollout is ${RolloutPhases.Degraded}`,
    };
  }

  if (applicationHealthStatus === HealthStatusCodes.Degraded) {
    return {
      argocdStatus: ArgoCDStatuses.ApplicationHealthDegraded,
      argocdTitle: `Application health status is ${HealthStatusCodes.Degraded}`,
    };
  }

  const applicationSyncStatus = application.status.sync.status;
  if (applicationSyncStatus === SyncStatusCodes.OutOfSync) {
    return {
      argocdStatus: ArgoCDStatuses.ApplicationOutOfSync,
      argocdTitle: `Application sync status is ${SyncStatusCodes.OutOfSync}`,
    };
  }

  const rolloutVersion = rollout.metadata.labels?.[APP_VERSION_LABEL];
  if (rolloutVersion == null) {
    return {
      argocdStatus: ArgoCDStatuses.RolloutVersionNotFound,
      argocdTitle: `Rollout version label is missing: ${APP_VERSION_LABEL}`,
    };
  }

  if (workflowNode != null) {
    const expectedRolloutVersion = getWorkflowRevision(
      workflowNode.workflow.memo.parameterMap,
    );
    if (expectedRolloutVersion !== rolloutVersion) {
      return {
        argocdStatus: ArgoCDStatuses.RolloutVersionMismatch,
        argocdTitle: `Expected version ${expectedRolloutVersion} but got ${rolloutVersion}`,
      };
    }
  }

  const { enabled: autoSyncEnabled } = application.spec.syncPolicy.automated;
  if (!autoSyncEnabled) {
    return {
      argocdStatus: ArgoCDStatuses.ApplicationSyncDisabled,
      argocdTitle: `Pause Reason: ${String(step.pausedReason)}`,
    };
  }

  if (applicationHealthStatus === HealthStatusCodes.Unknown) {
    return {
      argocdStatus: ArgoCDStatuses.ApplicationHealthUnknown,
      argocdTitle: `Application health status is ${HealthStatusCodes.Unknown}`,
    };
  }

  if (applicationSyncStatus === SyncStatusCodes.Unknown) {
    return {
      argocdStatus: ArgoCDStatuses.ApplicationSyncUnknown,
      argocdTitle: `Application sync status is ${SyncStatusCodes.Unknown}`,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (applicationSyncStatus !== SyncStatusCodes.Synced) {
    applicationSyncStatus satisfies never;
    console.log("unknown sync status");
    console.log(applicationSyncStatus);
    throw new ArgoCDStatusUtilError("invalid sync status");
  }

  if (
    rolloutPhase === RolloutPhases.Healthy &&
    applicationHealthStatus === HealthStatusCodes.Healthy
  ) {
    return {
      argocdStatus: ArgoCDStatuses.Healthy,
      argocdTitle: "Healthy",
    };
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
    throw new ArgoCDStatusUtilError("invalid rollout phase");
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
    throw new ArgoCDStatusUtilError("invalid application health status");
  }

  return {
    argocdStatus: ArgoCDStatuses.Deploying,
    argocdTitle: `Rollout ${rolloutPhase}, Application ${applicationHealthStatus}`,
  };
}

class ArgoCDStatusUtilError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { ArgoCDStatuses, getArgoCDStatus };
