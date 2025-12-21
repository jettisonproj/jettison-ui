import { Fragment } from "react";

import { Timestamp } from "src/components/timestamp/Timestamp.tsx";
import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";
import styles from "src/components/flow/history/selected/SelectedHistorySummaryTab.module.css";

interface SelectedHistorySummaryTabProps {
  node: WorkflowStatusNode;
}
function SelectedHistorySummaryTab({ node }: SelectedHistorySummaryTabProps) {
  const startedAt = new Date(node.startedAt);
  return (
    <>
      <div className={styles.summaryTab}>
        <span className={styles.summaryTabKey}>Name</span>
        <span>{node.displayName}</span>
        <span className={styles.summaryTabKey}>Template</span>
        <span>{node.templateRef.template}</span>
        <span className={styles.summaryTabKey}>Phase</span>
        <span>{node.phase}</span>
        <span className={styles.summaryTabKey}>Started At</span>
        <Timestamp className={styles.timestampText} date={startedAt} />
        <span className={styles.summaryTabKey}>Finished At</span>
        {node.finishedAt ? (
          <Timestamp
            className={styles.timestampText}
            date={new Date(node.finishedAt)}
          />
        ) : (
          <span>{node.finishedAt}</span>
        )}
      </div>
      <div className={styles.summaryTabParameters}>Parameters</div>
      <div className={styles.summaryTab}>
        {node.inputs?.parameters.map((param) => (
          <Fragment key={param.name}>
            <span className={styles.summaryTabKey}>{param.name}</span>
            <span>{param.value}</span>
          </Fragment>
        ))}
      </div>
    </>
  );
}

export { SelectedHistorySummaryTab };
