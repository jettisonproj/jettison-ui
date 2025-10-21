import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";

interface WorkflowGraphNodeProps {
  node: WorkflowStatusNode;
  workflowBaseUrl: string;
}

export type { WorkflowGraphNodeProps };
