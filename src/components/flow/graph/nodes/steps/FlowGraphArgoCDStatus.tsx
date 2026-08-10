import type { JSX } from "react";
import { useContext } from "react";

import {
  ArgoCDStatuses,
  getArgoCDStatus,
} from "src/components/flow/graph/nodes/steps/argocdStatusUtil.ts";
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
import { APP_VERSION_LABEL } from "src/utils/resourceUtil.ts";
import type { WorkflowNode } from "src/utils/workflowUtil.ts";

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
  const applications = useContext(ApplicationsContext);
  const rollouts = useContext(RolloutsContext);

  const argocdStatusResponse = getArgoCDStatus(
    step,
    workflowNode,
    applications,
    rollouts,
  );

  const { argocdStatus } = argocdStatusResponse;

  switch (argocdStatus) {
    case ArgoCDStatuses.Loading:
      return <LoadIcon />;
    case ArgoCDStatuses.ApplicationNotFound:
      return (
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={"Application not found"}
        />
      );
    case ArgoCDStatuses.ApplicationRolloutNotFound:
      return (
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={"Application rollout not found"}
        />
      );
    case ArgoCDStatuses.RolloutNotFound:
      return (
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={"Rollout not found"}
        />
      );
    case ArgoCDStatuses.ApplicationResourceNotFound:
      return (
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={"Application resource is missing"}
        />
      );
    case ArgoCDStatuses.RolloutStatusDegraded:
      return (
        <ArgoCDFailingBadge
          stepDetailsLink={stepDetailsLink}
          title={`Rollout is ${RolloutPhases.Degraded}`}
        />
      );
    case ArgoCDStatuses.ApplicationHealthDegraded:
      return (
        <ArgoCDFailingBadge
          stepDetailsLink={stepDetailsLink}
          title={`Application health status is ${HealthStatusCodes.Degraded}`}
        />
      );
    case ArgoCDStatuses.ApplicationOutOfSync:
      return (
        <ArgoCDDriftBadge
          stepDetailsLink={stepDetailsLink}
          title={`Application sync status is ${SyncStatusCodes.OutOfSync}`}
        />
      );
    case ArgoCDStatuses.RolloutVersionNotFound:
      return (
        <ArgoCDDriftBadge
          stepDetailsLink={stepDetailsLink}
          title={`Rollout version label is missing: ${APP_VERSION_LABEL}`}
        />
      );
    case ArgoCDStatuses.RolloutVersionMismatch: {
      const { expectedRolloutVersion, rolloutVersion } = argocdStatusResponse;
      return (
        <ArgoCDDriftBadge
          stepDetailsLink={stepDetailsLink}
          title={`Expected version ${expectedRolloutVersion} but got ${rolloutVersion}`}
        />
      );
    }
    case ArgoCDStatuses.ApplicationSyncDisabled:
      return (
        <ArgoCDPausedBadge
          stepDetailsLink={stepDetailsLink}
          title={`Pause Reason: ${String(step.pausedReason)}`}
        />
      );
    case ArgoCDStatuses.ApplicationHealthUnknown:
      return (
        <ArgoCDUnknownBadge
          stepDetailsLink={stepDetailsLink}
          title={`Application health status is ${HealthStatusCodes.Unknown}`}
        />
      );
    case ArgoCDStatuses.ApplicationSyncUnknown:
      return (
        <ArgoCDUnknownBadge
          stepDetailsLink={stepDetailsLink}
          title={`Application sync status is ${SyncStatusCodes.Unknown}`}
        />
      );
    case ArgoCDStatuses.Healthy:
      return <ArgoCDLiveBadge stepDetailsLink={stepDetailsLink} />;
    case ArgoCDStatuses.Deploying: {
      const { rolloutPhase, applicationHealthStatus } = argocdStatusResponse;
      return (
        <ArgoCDDeployingBadge
          stepDetailsLink={stepDetailsLink}
          title={`Rollout ${rolloutPhase}, Application ${applicationHealthStatus}`}
        />
      );
    }
    default:
      argocdStatus satisfies never;
      console.log("unknown argocd status");
      console.log(argocdStatus);
      throw new FlowGraphArgoCDStatusError("unexpected argocd status");
  }
}

class FlowGraphArgoCDStatusError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowGraphArgoCDStatus };
