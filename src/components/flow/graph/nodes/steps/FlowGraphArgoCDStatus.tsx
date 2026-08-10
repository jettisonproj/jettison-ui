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
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import {
  ApplicationsContext,
  RolloutsContext,
} from "src/providers/provider.tsx";
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

  const { argocdStatus, argocdTitle } = argocdStatusResponse;

  switch (argocdStatus) {
    case ArgoCDStatuses.Loading:
      return <LoadIcon />;
    case ArgoCDStatuses.ApplicationNotFound:
      return (
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.ApplicationRolloutNotFound:
      return (
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.RolloutNotFound:
      return (
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.ApplicationResourceNotFound:
      return (
        <ArgoCDNotFoundBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.RolloutStatusDegraded:
      return (
        <ArgoCDFailingBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.ApplicationHealthDegraded:
      return (
        <ArgoCDFailingBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.ApplicationOutOfSync:
      return (
        <ArgoCDDriftBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.RolloutVersionNotFound:
      return (
        <ArgoCDDriftBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.RolloutVersionMismatch: {
      return (
        <ArgoCDDriftBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    }
    case ArgoCDStatuses.ApplicationSyncDisabled:
      return (
        <ArgoCDPausedBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.ApplicationHealthUnknown:
      return (
        <ArgoCDUnknownBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.ApplicationSyncUnknown:
      return (
        <ArgoCDUnknownBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
        />
      );
    case ArgoCDStatuses.Healthy:
      return <ArgoCDLiveBadge stepDetailsLink={stepDetailsLink} />;
    case ArgoCDStatuses.Deploying: {
      return (
        <ArgoCDDeployingBadge
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
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
