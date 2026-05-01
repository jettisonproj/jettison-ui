import { useMemo } from "react";
import { Link } from "react-router";

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
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { prTriggerRoute, pushTriggerRoute, routes } from "src/routes.ts";
import {
  getLastWorkflow,
  getNumActiveWorkflows,
} from "src/utils/workflowUtil.ts";

interface RepoProps {
  repoOrg: string;
  repoName: string;
  pushWorkflows: Map<string, Workflow> | null | undefined;
  prWorkflows: Map<string, Workflow> | null | undefined;
}
function Repo({ repoOrg, repoName, pushWorkflows, prWorkflows }: RepoProps) {
  const pushWorkflow = useMemo(
    () => getLastWorkflow(pushWorkflows),
    [pushWorkflows],
  );
  const numActivePrWorkflows = useMemo(
    () => getNumActiveWorkflows(prWorkflows),
    [prWorkflows],
  );
  const pushFlowLink = `${routes.flows}/${repoOrg}/${repoName}/${pushTriggerRoute}`;
  const prFlowLink = `${routes.flows}/${repoOrg}/${repoName}/${prTriggerRoute}`;
  return (
    <div className={styles.repo}>
      <div className={styles.repoTitle}>
        <Link to={pushFlowLink} className={styles.repoLink}>
          {repoName}
        </Link>
        <RepoStatusBadge workflow={pushWorkflow} />
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
function RepoStatusBadge({ workflow }: RepoStatusBadgeProps) {
  if (workflow === null) {
    return <LoadIcon />;
  }
  if (workflow === undefined) {
    return <FlowHistoryPendingBadge />;
  }
  return <FlowHistoryStatusBadge workflow={workflow} isPrFlow={false} />;
}

interface RepoMessageProps {
  workflow: Workflow | null | undefined;
}
function RepoMessage({ workflow }: RepoMessageProps) {
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

function RepoMessageSkeleton() {
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
}: RepoSubtitleProps) {
  if (workflow === null) {
    return <RepoSubtitleSkeleton />;
  }
  if (workflow === undefined) {
    return (
      <div className={styles.repoSkeleton}>
        <div className={styles.repoWorkflowsEmpty}>
          Waiting for workflow run
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

function RepoSubtitleSkeleton() {
  return (
    <div className={styles.repoSkeleton}>
      <div className={styles.repoSubtitleSkeleton} />
    </div>
  );
}

export { Repo };
