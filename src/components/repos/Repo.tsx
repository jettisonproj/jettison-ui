import { useMemo } from "react";
import { Link } from "react-router";

import {
  FlowHistorySubtitle,
  FlowHistoryTitle,
} from "src/components/flow/history/FlowHistoryItem.tsx";
import styles from "src/components/repos/Repo.module.css";
import { RepoStatusBadge } from "src/components/repos/RepoStatusBadge.tsx";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { pushTriggerRoute, routes } from "src/routes.ts";
import { getLastWorkflow } from "src/utils/workflowUtil.ts";

// const numActivePrWorkflows = useMemo(
//   () => getNumActiveWorkflows(prWorkflows),
//   [prWorkflows],
// );

interface RepoProps {
  repoOrg: string;
  repoName: string;
  isFirst: boolean;
  pushWorkflows: Map<string, Workflow> | null | undefined;
  prWorkflows: Map<string, Workflow> | null | undefined;
}
function Repo({
  repoOrg,
  repoName,
  isFirst,
  pushWorkflows,
  // prWorkflows,
}: RepoProps) {
  const pushWorkflow = useMemo(
    () => getLastWorkflow(pushWorkflows),
    [pushWorkflows],
  );
  const repoClassName = isFirst ? styles.repoFirst : styles.repo;
  return (
    <div className={repoClassName}>
      <div className={styles.repoTitle}>
        <Link
          to={`${routes.flows}/${repoOrg}/${repoName}/${pushTriggerRoute}`}
          className={styles.repoLink}
        >
          {repoName}
        </Link>
        <RepoStatusBadge workflow={pushWorkflow} />
      </div>
      {pushWorkflow && (
        <>
          <FlowHistoryTitle
            isPrFlow={false}
            workflow={pushWorkflow}
            repoOrg={repoOrg}
            isSelected={false}
          />
          <FlowHistorySubtitle workflow={pushWorkflow} />
        </>
      )}
    </div>
  );
}

export { Repo };
