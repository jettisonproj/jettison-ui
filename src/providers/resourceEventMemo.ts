import type { Workflow } from "src/data/types/workflowTypes.ts";

function memoizeWorkflow(workflow: Workflow) {
  const { parameters } = workflow.spec.arguments;
  const parameterMap: Record<string, string> = {};
  parameters.forEach((parameter) => {
    parameterMap[parameter.name] = parameter.value;
  });

  const startedAt = new Date(workflow.status.startedAt);
  workflow.memo = {
    parameterMap,
    startedAt,
  };

  const finishedAt = workflow.status.finishedAt;
  if (finishedAt != null) {
    workflow.memo.finishedAt = new Date(finishedAt);
  }
}

export { memoizeWorkflow };
