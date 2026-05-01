import { useMemo } from "react";
import { Link } from "react-router";

import {
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
import { pushTriggerRoute, routes } from "src/routes.ts";
import { getLastWorkflow } from "src/utils/workflowUtil.ts";

// todos
// - add num active pr notifications
// - verify loading states (skeletons)
// - possibly add more visualizations
// const numActivePrWorkflows = useMemo(
//   () => getNumActiveWorkflows(prWorkflows),
//   [prWorkflows],
// );

interface RepoProps {
  repoOrg: string;
  repoName: string;
  pushWorkflows: Map<string, Workflow> | null | undefined;
  prWorkflows: Map<string, Workflow> | null | undefined;
}
function Repo({
  repoOrg,
  repoName,
  pushWorkflows,
  // prWorkflows,
}: RepoProps) {
  const pushWorkflow = useMemo(
    () => getLastWorkflow(pushWorkflows),
    [pushWorkflows],
  );
  return (
    <div className={styles.repo}>
      <div className={styles.repoTitle}>
        <Link
          to={`${routes.flows}/${repoOrg}/${repoName}/${pushTriggerRoute}`}
          className={styles.repoLink}
        >
          {repoName}
        </Link>
        <RepoStatusBadge workflow={pushWorkflow} />
      </div>
      <RepoMessage workflow={pushWorkflow} />
      <RepoSubtitle workflow={pushWorkflow} />
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
  if (workflow == undefined) {
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
  if (workflow == undefined) {
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
}
function RepoSubtitle({ workflow }: RepoSubtitleProps) {
  if (workflow === null) {
    return <RepoSubtitleSkeleton />;
  }
  if (workflow == undefined) {
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
