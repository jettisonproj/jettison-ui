import { Link } from "react-router";

import type { Step } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { flowDefaultStepName } from "src/data/data.ts";
import { NodePhase } from "src/data/types/workflowTypes.ts";
import { EXIT_NODE_NAME } from "src/utils/workflowUtil.ts";
import { ElapsedTime } from "src/components/elapsedtime/ElapsedTime.tsx";
import { concatStyles } from "src/utils/styleUtil.ts";
import styles from "src/components/flow/history/FlowHistoryGrid.module.css";

interface FlowHistoryGridProps {
  flowSteps: Step[];
  workflow: Workflow;
  workflowBaseUrl: string;
  isSelected: boolean;
  selectedNodeName: string;
}
function FlowHistoryGrid({
  flowSteps,
  workflow,
  workflowBaseUrl,
  isSelected,
  selectedNodeName,
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
          nodeStartedAt={node.startedAt}
          workflowBaseUrl={workflowBaseUrl}
          isSelected={isSelected && selectedNodeName === node.displayName}
        />
      ))}
      {nodesPendingCreation.map((nodeDisplayName) => (
        <FlowHistoryGridItem
          key={nodeDisplayName}
          nodeDisplayName={nodeDisplayName}
          nodePhase={NodePhase.Pending}
          nodeDuration={undefined}
          nodeStartedAt={undefined}
          workflowBaseUrl={workflowBaseUrl}
          isSelected={isSelected && selectedNodeName === nodeDisplayName}
        />
      ))}
      {exitNodePendingCreation && (
        <FlowHistoryGridItem
          key={EXIT_NODE_NAME}
          nodeDisplayName={EXIT_NODE_NAME}
          nodePhase={NodePhase.Pending}
          nodeDuration={undefined}
          nodeStartedAt={undefined}
          workflowBaseUrl={workflowBaseUrl}
          isSelected={isSelected && selectedNodeName === EXIT_NODE_NAME}
        />
      )}
    </div>
  );
}

interface FlowHistoryGridItemProps {
  nodeDisplayName: string;
  nodePhase: NodePhase;
  nodeDuration: string | undefined;
  nodeStartedAt: Date | undefined;
  workflowBaseUrl: string;
  isSelected: boolean;
}
function FlowHistoryGridItem({
  nodeDisplayName,
  nodePhase,
  nodeDuration,
  nodeStartedAt,
  workflowBaseUrl,
  isSelected,
}: FlowHistoryGridItemProps) {
  let className = concatStyles(
    styles.historyGridItem,
    styles.historyGridItemSelected,
    isSelected,
  );

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
        <NodeDuration
          nodeDuration={nodeDuration}
          nodePhase={nodePhase}
          nodeStartedAt={nodeStartedAt}
        />
      </div>
    </Link>
  );
}

interface NodeDurationProps {
  nodePhase: NodePhase;
  nodeDuration: string | undefined;
  nodeStartedAt: Date | undefined;
}
function NodeDuration({
  nodePhase,
  nodeDuration,
  nodeStartedAt,
}: NodeDurationProps) {
  if (nodeDuration == null) {
    if (nodePhase === NodePhase.Running && nodeStartedAt != null) {
      return <ElapsedTime startedAt={nodeStartedAt} />;
    }
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
