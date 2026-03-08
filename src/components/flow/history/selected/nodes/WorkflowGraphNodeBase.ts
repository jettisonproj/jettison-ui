import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";
import type { Step } from "src/data/types/flowTypes.ts";
import { concatStyles } from "src/utils/styleUtil.ts";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";

interface WorkflowGraphNodeProps {
  node: WorkflowStatusNode;
  workflowBaseUrl: string;
  isSelected: boolean;
}

interface WorkflowPendingGraphNodeProps {
  nodePendingCreation: Step;
  workflowBaseUrl: string;
  isSelected: boolean;
}

function getWorkflowGraphNodeClass(isSelected: boolean) {
  return concatStyles(
    styles.nodeRowHeaderOnly,
    styles.nodeRowHeaderSelected,
    isSelected,
  );
}

export type { WorkflowGraphNodeProps, WorkflowPendingGraphNodeProps };
export { getWorkflowGraphNodeClass };
