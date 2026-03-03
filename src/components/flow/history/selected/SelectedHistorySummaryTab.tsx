import { Fragment } from "react";

import { Timestamp } from "src/components/timestamp/Timestamp.tsx";
import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";
import styles from "src/components/flow/history/selected/SelectedHistorySummaryTab.module.css";

interface SelectedHistorySummaryTabProps {
  selectedNode: WorkflowStatusNode;
}
function SelectedHistorySummaryTab({
  selectedNode,
}: SelectedHistorySummaryTabProps) {
  const startedAt = new Date(selectedNode.startedAt);
  return (
    <>
      <div className={styles.summaryTab}>
        <span className={styles.summaryTabKey}>Name</span>
        <span>{selectedNode.displayName}</span>
        <span className={styles.summaryTabKey}>Template</span>
        <span>{selectedNode.templateRef.template}</span>
        <span className={styles.summaryTabKey}>Phase</span>
        <span>{selectedNode.phase}</span>
        <span className={styles.summaryTabKey}>Started At</span>
        <Timestamp className={styles.timestampText} date={startedAt} />
        <span className={styles.summaryTabKey}>Finished At</span>
        {selectedNode.finishedAt ? (
          <Timestamp
            className={styles.timestampText}
            date={new Date(selectedNode.finishedAt)}
          />
        ) : (
          <span>{selectedNode.finishedAt}</span>
        )}
      </div>
      <div className={styles.summaryTabParameters}>Parameters</div>
      <div className={styles.summaryTab}>
        {selectedNode.inputs?.parameters.map((param) => (
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
