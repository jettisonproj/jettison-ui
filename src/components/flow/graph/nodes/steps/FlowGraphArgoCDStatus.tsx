import type { JSX } from "react";

import type { ArgoCDStatusResponse } from "src/components/flow/graph/nodes/steps/argocdStatusUtil.ts";
import { ArgoCDStatuses } from "src/components/flow/graph/nodes/steps/argocdStatusUtil.ts";
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

interface FlowGraphArgoCDStatusProps {
  className: string;
  stepDetailsLink: string;
  argocdStatusResponse: ArgoCDStatusResponse;
  textClassName?: string;
}
function FlowGraphArgoCDStatus({
  className,
  stepDetailsLink,
  argocdStatusResponse,
  textClassName,
}: FlowGraphArgoCDStatusProps): JSX.Element {
  const { argocdStatus, argocdTitle } = argocdStatusResponse;

  switch (argocdStatus) {
    case ArgoCDStatuses.Loading:
      return <LoadIcon />;
    case ArgoCDStatuses.ApplicationNotFound:
      return (
        <ArgoCDNotFoundBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.ApplicationRolloutNotFound:
      return (
        <ArgoCDNotFoundBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.RolloutNotFound:
      return (
        <ArgoCDNotFoundBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.ApplicationResourceNotFound:
      return (
        <ArgoCDNotFoundBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.RolloutStatusDegraded:
      return (
        <ArgoCDFailingBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.ApplicationHealthDegraded:
      return (
        <ArgoCDFailingBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.ApplicationOutOfSync:
      return (
        <ArgoCDDriftBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.RolloutVersionNotFound:
      return (
        <ArgoCDDriftBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.RolloutVersionMismatch: {
      return (
        <ArgoCDDriftBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    }
    case ArgoCDStatuses.ApplicationSyncDisabled:
      return (
        <ArgoCDPausedBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.ApplicationHealthUnknown:
      return (
        <ArgoCDUnknownBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.ApplicationSyncUnknown:
      return (
        <ArgoCDUnknownBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.Healthy:
      return (
        <ArgoCDLiveBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          textClassName={textClassName}
        />
      );
    case ArgoCDStatuses.Deploying: {
      return (
        <ArgoCDDeployingBadge
          className={className}
          stepDetailsLink={stepDetailsLink}
          title={argocdTitle}
          textClassName={textClassName}
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
