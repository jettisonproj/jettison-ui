import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import { routes } from "src/routes.ts";
import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import type {
  Workflow,
  WorkflowMemoStatusNode,
} from "src/data/types/workflowTypes.ts";
import { NodePhases } from "src/data/types/workflowTypes.ts";
import { TRIGGER_NODE_NAME } from "src/utils/workflowUtil.ts";
import { getTriggerRoute } from "src/routes.ts";

function getTriggerDetailsLink(
  repoOrg: string,
  repoName: string,
  isPrFlow: boolean,
  trigger: Trigger,
) {
  const triggerName = flowDefaultTriggerName(trigger);
  return getNodeDetailsLink(repoOrg, repoName, isPrFlow, triggerName);
}

function getStepDetailsLink(
  repoOrg: string,
  repoName: string,
  isPrFlow: boolean,
  step: Step,
) {
  const stepName = flowDefaultStepName(step);
  return getNodeDetailsLink(repoOrg, repoName, isPrFlow, stepName);
}

function getNodeDetailsLink(
  repoOrg: string,
  repoName: string,
  isPrFlow: boolean,
  nodeName: string,
) {
  const triggerRoute = getTriggerRoute(isPrFlow);
  return `${routes.flows}/${repoOrg}/${repoName}/${triggerRoute}/${nodeName}`;
}

function getLastWorkflowNodeForStep(step: Step, workflows: Workflow[]) {
  const stepName = flowDefaultStepName(step);
  return getLastWorkflowNode(stepName, workflows);
}

function getLastWorkflowNodeForTrigger(workflows: Workflow[]) {
  return getLastWorkflowNode(TRIGGER_NODE_NAME, workflows);
}

interface WorkflowNode {
  workflow: Workflow;
  node: WorkflowMemoStatusNode;
}
function getLastWorkflowNode(
  nodeName: string,
  workflows: Workflow[],
): WorkflowNode | null {
  if (workflows.length === 0) {
    return null;
  }
  for (const workflow of workflows) {
    const node = workflow.memo.nodes[nodeName];
    // todo improve check
    if (
      node != null &&
      node.phase !== NodePhases.Skipped &&
      node.phase !== NodePhases.Omitted &&
      node.outputMap["docker-build-pr-status"] !== "Skipped" &&
      node.outputMap["docker-build-commit-status"] !== "Skipped"
    ) {
      return { workflow, node };
    }
  }
  return null;
}

export {
  getTriggerDetailsLink,
  getStepDetailsLink,
  getLastWorkflowNodeForStep,
  getLastWorkflowNodeForTrigger,
};

export type { WorkflowNode };
