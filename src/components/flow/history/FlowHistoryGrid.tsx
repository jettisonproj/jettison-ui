import { Link } from "react-router";

import type { Step } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { flowDefaultStepName } from "src/data/data.ts";
import { NodePhase } from "src/data/types/workflowTypes.ts";
import { EXIT_NODE_NAME } from "src/utils/workflowUtil.ts";
import styles from "src/components/flow/history/FlowHistoryGrid.module.css";

interface FlowHistoryGridProps {
  flowSteps: Step[];
  workflow: Workflow;
  workflowBaseUrl: string;
}
function FlowHistoryGrid({
  flowSteps,
  workflow,
  workflowBaseUrl,
}: FlowHistoryGridProps) {
  const nodesPendingCreation = flowSteps
    .map((flowStep) => flowDefaultStepName(flowStep))
    .filter((stepName) => workflow.memo.nodes[stepName] == null);

  const exitNodePendingCreation = workflow.memo.nodes[EXIT_NODE_NAME] == null;

  return (
    <div className={styles.historyGrid}>
      {workflow.memo.sortedNodes.map((node) => (
        <FlowHistoryGridItem
          key={node.displayName}
          nodeDisplayName={node.displayName}
          nodePhase={node.phase}
          nodeDuration={node.duration}
          workflowBaseUrl={workflowBaseUrl}
        />
      ))}
      {nodesPendingCreation.map((nodeDisplayName) => (
        <FlowHistoryGridItem
          key={nodeDisplayName}
          nodeDisplayName={nodeDisplayName}
          nodePhase={NodePhase.Pending}
          nodeDuration={undefined}
          workflowBaseUrl={workflowBaseUrl}
        />
      ))}
      {exitNodePendingCreation && (
        <FlowHistoryGridItem
          key={EXIT_NODE_NAME}
          nodeDisplayName={EXIT_NODE_NAME}
          nodePhase={NodePhase.Pending}
          nodeDuration={undefined}
          workflowBaseUrl={workflowBaseUrl}
        />
      )}
    </div>
  );
}

interface FlowHistoryGridItemProps {
  nodeDisplayName: string;
  nodePhase: NodePhase;
  nodeDuration: string | undefined;
  workflowBaseUrl: string;
}
function FlowHistoryGridItem({
  nodeDisplayName,
  nodePhase,
  nodeDuration,
  workflowBaseUrl,
}: FlowHistoryGridItemProps) {
  let className = styles.historyGridItem;
  if (className == null) {
    throw new FlowHistoryGridError("empty className: historyGridItem");
  }

  switch (nodePhase) {
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
      nodePhase satisfies never;
      console.log("unknown node phase:");
      console.log(nodePhase);
      throw new FlowHistoryGridError(
        `unknown phase for node: ${nodeDisplayName}`,
      );
  }

  return (
    <Link
      to={`${workflowBaseUrl}?node=${nodeDisplayName}`}
      className={className}
      title={nodeDisplayName}
    >
      <div className={styles.historyGridText}>
        <NodeDuration nodeDuration={nodeDuration} />
      </div>
    </Link>
  );
}

interface NodeDurationProps {
  nodeDuration: string | undefined;
}
function NodeDuration({ nodeDuration }: NodeDurationProps) {
  if (nodeDuration == null) {
    return "-";
  }
  return nodeDuration;
}

class FlowHistoryGridError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistoryGrid };
