import type { Step } from "src/data/types/flowTypes.ts";
import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";

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

export type { WorkflowGraphNodeProps, WorkflowPendingGraphNodeProps };
