import type { Workflow } from "src/data/types/workflowTypes.ts";

function memoizeWorkflow(workflow: Workflow) {
  const { parameters } = workflow.spec.arguments;
  const parameterMap: Record<string, string> = {};
  parameters.forEach((parameter) => {
    parameterMap[parameter.name] = parameter.value;
  });

  workflow.memo = { parameterMap };
}

export { memoizeWorkflow };
