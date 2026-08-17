import type { JSX } from "react";
import { useContext, useMemo } from "react";
import { Link } from "react-router";

import type { ArgoCDStatusResponse } from "src/components/flow/graph/nodes/steps/argocdStatusUtil.ts";
import { getArgoCDStatus } from "src/components/flow/graph/nodes/steps/argocdStatusUtil.ts";
import { FlowGraphArgoCDStatus } from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDStatus.tsx";
import {
  FlowHistoryActivePrWorkflows,
  FlowHistoryAuthor,
  FlowHistoryBranch,
  FlowHistoryDuration,
  FlowHistoryMessage,
  FlowHistoryTimestamp,
} from "src/components/flow/history/FlowHistoryItem.tsx";
import {
  FlowHistoryPendingBadge,
  FlowHistoryStatusBadge,
} from "src/components/flow/history/FlowHistoryStatusBadge.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import styles from "src/components/repos/Repo.module.css";
import type { Flow } from "src/data/types/flowTypes.ts";
import { StepSources } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  ApplicationsContext,
  RolloutsContext,
} from "src/providers/provider.tsx";
import { prTriggerRoute, pushTriggerRoute, routes } from "src/routes.ts";
import { getStepDetailsLink } from "src/utils/flowUtil.ts";
import {
  getLastWorkflowNodeForStep,
  getNumActiveWorkflows,
  workflowCompareFn,
} from "src/utils/workflowUtil.ts";

interface RepoProps {
  repoOrg: string;
  repoName: string;
  pushFlow: Flow | null;
  pushWorkflows: Map<string, Workflow> | null | undefined;
  prWorkflows: Map<string, Workflow> | null | undefined;
}
function Repo({
  repoOrg,
  repoName,
  pushFlow,
  pushWorkflows,
  prWorkflows,
}: RepoProps): JSX.Element {
  const sortedPushWorkflows = useMemo(() => {
    if (pushWorkflows === null) {
      return null;
    }
    if (pushWorkflows === undefined) {
      return null;
    }
    return Array.from(pushWorkflows.values()).sort(workflowCompareFn);
  }, [pushWorkflows]);

  const numActivePrWorkflows = useMemo(
    () => getNumActiveWorkflows(prWorkflows),
    [prWorkflows],
  );
  const pushWorkflow = sortedPushWorkflows
    ? sortedPushWorkflows[0]
    : sortedPushWorkflows;
  const pushFlowLink = `${routes.flows}/${repoOrg}/${repoName}/${pushTriggerRoute}`;
  const prFlowLink = `${routes.flows}/${repoOrg}/${repoName}/${prTriggerRoute}`;
  return (
    <div className={styles.repo}>
      <div className={styles.repoTitle}>
        <Link to={pushFlowLink} className={styles.repoLink}>
          {repoName}
        </Link>
        <div className={styles.repoBadges}>
          <RepoResourceStatus
            repoOrg={repoOrg}
            repoName={repoName}
            workflows={sortedPushWorkflows ?? []}
            pushFlow={pushFlow}
            pushFlowLink={pushFlowLink}
          />
          <RepoStatusBadge workflow={pushWorkflow} />
        </div>
      </div>
      <RepoMessage workflow={pushWorkflow} />
      <RepoSubtitle
        workflow={pushWorkflow}
        prFlowLink={prFlowLink}
        numActivePrWorkflows={numActivePrWorkflows}
      />
    </div>
  );
}

interface RepoStatusBadgeProps {
  workflow: Workflow | null | undefined;
}
function RepoStatusBadge({ workflow }: RepoStatusBadgeProps): JSX.Element {
  if (workflow === null) {
    return <LoadIcon />;
  }
  if (workflow === undefined) {
    return <FlowHistoryPendingBadge />;
  }
  return (
    <FlowHistoryStatusBadge
      className={styles.repoHistoryStatusBadge}
      workflow={workflow}
      isPrFlow={false}
    />
  );
}

interface RepoMessageProps {
  workflow: Workflow | null | undefined;
}
function RepoMessage({ workflow }: RepoMessageProps): JSX.Element | null {
  if (workflow === null) {
    return <RepoMessageSkeleton />;
  }
  if (workflow === undefined) {
    return null;
  }
  return (
    <div className={styles.repoMessage}>
      <FlowHistoryMessage workflow={workflow} isPrFlow={false} />
    </div>
  );
}

function RepoMessageSkeleton(): JSX.Element {
  return (
    <div className={styles.repoSkeleton}>
      <div className={styles.repoMessageSkeleton} />
    </div>
  );
}

interface RepoSubtitleProps {
  workflow: Workflow | null | undefined;
  prFlowLink: string;
  numActivePrWorkflows: number;
}
function RepoSubtitle({
  workflow,
  prFlowLink,
  numActivePrWorkflows,
}: RepoSubtitleProps): JSX.Element {
  if (workflow === null) {
    return <RepoSubtitleSkeleton />;
  }
  if (workflow === undefined) {
    return (
      <div className={styles.repoSkeleton}>
        <div className={styles.repoWorkflowsEmpty}>
          Waiting for workflow run...
        </div>
      </div>
    );
  }
  return (
    <div className={styles.repoSubtitle}>
      <FlowHistoryAuthor workflow={workflow} />
      <FlowHistoryTimestamp workflow={workflow} />
      <FlowHistoryDuration workflow={workflow} />
      <FlowHistoryBranch workflow={workflow} />
      <FlowHistoryActivePrWorkflows
        prFlowLink={prFlowLink}
        numActivePrWorkflows={numActivePrWorkflows}
      />
    </div>
  );
}

interface RepoResourceStatusProps {
  repoOrg: string;
  repoName: string;
  workflows: Workflow[];
  pushFlow: Flow | null;
  pushFlowLink: string;
}
function RepoResourceStatus({
  repoOrg,
  repoName,
  workflows,
  pushFlow,
  pushFlowLink,
}: RepoResourceStatusProps): JSX.Element | null {
  const applications = useContext(ApplicationsContext);
  const rollouts = useContext(RolloutsContext);
  if (applications == null || rollouts == null || pushFlow == null) {
    // There is already a skeleton in this row, no need to show anything
    return null;
  }

  const argocdSteps = pushFlow.spec.steps.filter(
    (step) => step.stepSource === StepSources.ArgoCD,
  );

  if (argocdSteps.length === 0) {
    return null;
  }

  if (argocdSteps.length === 1) {
    // If the flow contains a single resource, link to that resource
    const argocdStep = argocdSteps[0];
    if (argocdStep == null) {
      throw new RepoError("failed to get Argo CD step");
    }

    const stepDetailsLink = getStepDetailsLink(
      repoOrg,
      repoName,
      false,
      argocdStep,
    );
    const argocdStatusResponse = getArgoCDStatus(
      argocdStep,
      getLastWorkflowNodeForStep(argocdStep, workflows)?.workflow,
      applications,
      rollouts,
    );

    return (
      <FlowGraphArgoCDStatus
        className={styles.repoResourceStatusBadge}
        stepDetailsLink={stepDetailsLink}
        argocdStatusResponse={argocdStatusResponse}
        textClassName={styles.repoResourceStatusBadgeText}
      />
    );
  }

  // If the flow contains multiple resources, link to the flow
  const argocdStatusResponse = argocdSteps.reduce<
    ArgoCDStatusResponse | undefined
  >((prevStatus, currStep) => {
    const currStatus = getArgoCDStatus(
      currStep,
      getLastWorkflowNodeForStep(currStep, workflows)?.workflow,
      applications,
      rollouts,
    );
    if (prevStatus == null) {
      return currStatus;
    }
    if (currStatus.argocdStatus < prevStatus.argocdStatus) {
      return currStatus;
    }
    return prevStatus;
  }, undefined);

  if (argocdStatusResponse == null) {
    throw new RepoError("failed to find argocd status for flow");
  }

  return (
    <FlowGraphArgoCDStatus
      className={styles.repoResourceStatusBadge}
      stepDetailsLink={pushFlowLink}
      argocdStatusResponse={argocdStatusResponse}
      textClassName={styles.repoResourceStatusBadgeText}
    />
  );
}

function RepoSubtitleSkeleton(): JSX.Element {
  return (
    <div className={styles.repoSkeleton}>
      <div className={styles.repoSubtitleSkeleton} />
    </div>
  );
}

class RepoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { Repo };
