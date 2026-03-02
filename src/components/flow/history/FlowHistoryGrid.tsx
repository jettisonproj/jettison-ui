import { Link } from "react-router";

import type {
  Workflow,
  WorkflowMemoStatusNode,
} from "src/data/types/workflowTypes.ts";
import { NodePhase } from "src/data/types/workflowTypes.ts";
import styles from "src/components/flow/history/FlowHistoryGrid.module.css";

interface FlowHistoryGridProps {
  workflow: Workflow;
  workflowBaseUrl: string;
}
function FlowHistoryGrid({ workflow, workflowBaseUrl }: FlowHistoryGridProps) {
  return (
    <div className={styles.historyGrid}>
      {workflow.memo.sortedNodes.map((node) => (
        <FlowHistoryGridItem
          key={node.displayName}
          node={node}
          workflowBaseUrl={workflowBaseUrl}
        />
      ))}
    </div>
  );
}

interface FlowHistoryGridItemProps {
  node: WorkflowMemoStatusNode;
  workflowBaseUrl: string;
}
function FlowHistoryGridItem({
  node,
  workflowBaseUrl,
}: FlowHistoryGridItemProps) {
  let className = styles.historyGridItem;
  if (className == null) {
    throw new FlowHistoryGridError("empty className: historyGridItem");
  }

  const { phase } = node;
  switch (phase) {
    case NodePhase.Succeeded:
      className += ` ${styles.historyGridSuccess}`;
      break;
    case NodePhase.Error:
      className += ` ${styles.historyGridDanger}`;
      break;
    case NodePhase.Failed:
      className += ` ${styles.historyGridDanger}`;
      break;
    case NodePhase.Running:
      className += ` ${styles.historyGridRunning}`;
      break;
    case NodePhase.Pending:
      className += ` ${styles.historyGridPending}`;
      break;
    case NodePhase.Skipped:
    case NodePhase.Omitted:
      className += ` ${styles.historyGridSkipped}`;
      break;
    default:
      phase satisfies never;
      console.log("unknown node phase:");
      console.log(phase);
      throw new FlowHistoryGridError(
        `unknown phase for node: ${node.displayName}`,
      );
  }

  const nodeDuration = node.duration ?? "-";

  return (
    <Link
      to={`${workflowBaseUrl}?node=${node.displayName}`}
      className={className}
      title={node.displayName}
    >
      <div className={styles.historyGridText}>{nodeDuration}</div>
    </Link>
  );
}

class FlowHistoryGridError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistoryGrid };
