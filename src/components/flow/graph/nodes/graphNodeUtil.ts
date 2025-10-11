import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import { routes } from "src/routes.ts";
import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import type {
  Workflow,
  WorkflowMemoStatusNode,
} from "src/data/types/workflowTypes.ts";
import { NodePhase } from "src/data/types/workflowTypes.ts";
import { trimGitSuffix } from "src/utils/gitUtil.ts";
import { getTriggerRoute } from "src/routes.ts";

const TRIGGER_NODE_NAME = "github-check-start";

/**
 * Return the last path component as a shorthand for
 * displaying the repo name
 */
function getDisplayRepoPath(pathname: string, defaultValue: string) {
  const pathnameParts = pathname.split("/");

  let lastPathnamePart = pathnameParts.pop();

  // Handle potential trailing or duplicate slashes
  while (!lastPathnamePart && pathnameParts.length > 0) {
    lastPathnamePart = pathnameParts.pop();
  }

  if (!lastPathnamePart) {
    // If unable to find last path component, return the full url
    return defaultValue;
  }

  // Remove the .git suffix for readability
  return trimGitSuffix(lastPathnamePart);
}

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
      node.phase !== NodePhase.Skipped &&
      node.phase !== NodePhase.Omitted &&
      node.outputMap["docker-build-pr-status"] !== "Skipped" &&
      node.outputMap["docker-build-commit-status"] !== "Skipped"
    ) {
      return { workflow, node };
    }
  }
  return null;
}

export {
  getDisplayRepoPath,
  getTriggerDetailsLink,
  getStepDetailsLink,
  getLastWorkflowNodeForStep,
  getLastWorkflowNodeForTrigger,
};

export type { WorkflowNode };
