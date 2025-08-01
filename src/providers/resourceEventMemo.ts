import type {
  Workflow,
  WorkflowMemoStatusNode,
} from "src/data/types/workflowTypes.ts";

function memoizeWorkflow(workflow: Workflow) {
  // Memoize or re-key the node status using the displayName
  // Also convert dates to Date type
  const nodes: Record<string, WorkflowMemoStatusNode> = {};
  Object.values(workflow.status.nodes).forEach((node) => {
    const { displayName, phase, startedAt, finishedAt, inputs } = node;

    const parameterMap: Record<string, string> = {};
    inputs?.parameters.forEach((parameter) => {
      parameterMap[parameter.name] = parameter.value;
    });

    const memoNode: WorkflowMemoStatusNode = {
      displayName,
      phase,
      startedAt: new Date(startedAt),
      parameterMap,
    };
    if (finishedAt != null) {
      memoNode.finishedAt = new Date(finishedAt);
    }
    nodes[node.displayName] = memoNode;
  });

  // Memoize the parameter List to a Map
  const { parameters } = workflow.spec.arguments;
  const parameterMap: Record<string, string> = {};
  parameters.forEach((parameter) => {
    parameterMap[parameter.name] = parameter.value;
  });

  // Memoize the startedAt string to a Date
  const startedAt = new Date(workflow.status.startedAt);
  workflow.memo = {
    parameterMap,
    startedAt,
    nodes,
  };

  // Memoize the finishedAt string to a Date
  const finishedAt = workflow.status.finishedAt;
  if (finishedAt != null) {
    workflow.memo.finishedAt = new Date(finishedAt);
  }
}

export { memoizeWorkflow };
