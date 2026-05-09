import type { Flow } from "src/data/types/flowTypes.ts";
import type {
  Workflow,
  WorkflowMemoStatusNode,
  WorkflowStatusNode,
} from "src/data/types/workflowTypes.ts";
import { TemplateNameValues } from "src/data/types/workflowTypes.ts";
import { formatDurationFromMs } from "src/utils/dateUtil.ts";
import { getFlowTrigger, isPullRequestTrigger } from "src/utils/flowUtil.ts";
import {
  EXIT_NODE_NAME,
  EXIT_NODE_SUFFIX,
  isMemoizedNode,
  workflowMemoNodeCompareFn,
} from "src/utils/workflowUtil.ts";

function memoizeFlow(flow: Flow) {
  const trigger = getFlowTrigger(flow);
  const isPrFlow = isPullRequestTrigger(trigger);

  flow.memo = { trigger, isPrFlow };
}

function memoizeWorkflow(workflow: Workflow) {
  // Memoize or re-key the node status using the displayName
  // Also convert dates to Date type and add duration
  const nodes: Record<string, WorkflowMemoStatusNode> = {};
  const sortedNodes: WorkflowMemoStatusNode[] = [];
  if (workflow.status.nodes != null) {
    Object.values(workflow.status.nodes).forEach((node) => {
      const { type } = node;

      if (!isMemoizedNode(type)) {
        return;
      }

      memoizeWorkflowStatusNode(node);

      const memoNode = node.memo;
      nodes[memoNode.displayName] = memoNode;
      sortedNodes.push(memoNode);
    });
  }

  // Memoize the sorted nodes by startedAt
  sortedNodes.sort(workflowMemoNodeCompareFn);

  // Memoize the parameter List to a Map
  const { parameters } = workflow.spec.arguments;
  const parameterMap: Record<string, string> = {};
  parameters.forEach((parameter) => {
    parameterMap[parameter.name] = parameter.value;
  });

  workflow.memo = {
    parameterMap,
    nodes,
    sortedNodes,
  };

  // Memoize the startedAt string to a Date
  const startedAt = workflow.status.startedAt;
  if (startedAt != null) {
    const startedAtDate = new Date(startedAt);
    workflow.memo.startedAt = startedAtDate;
  }

  // Memoize the finishedAt string to a Date. Also, memoize the duration
  const finishedAt = workflow.status.finishedAt;
  if (finishedAt != null) {
    const finishedAtDate = new Date(finishedAt);
    workflow.memo.finishedAt = finishedAtDate;

    const startedAtDate = workflow.memo.startedAt;
    if (startedAtDate != null) {
      workflow.memo.duration = formatDurationFromMs(
        finishedAtDate.getTime() - startedAtDate.getTime(),
      );
    }
  }
}

function memoizeWorkflowStatusNode(node: WorkflowStatusNode) {
  const { displayName, phase, startedAt, finishedAt, inputs, outputs } = node;

  const parameterMap: Record<string, string> = {};
  inputs?.parameters.forEach((parameter) => {
    parameterMap[parameter.name] = parameter.value;
  });

  const outputMap: Record<string, string> = {};
  outputs?.parameters?.forEach((parameter) => {
    outputMap[parameter.name] = parameter.value;
  });

  const startedAtDate = new Date(startedAt);

  const memoDisplayName = getMemoDisplayName(displayName);
  const memoNode: WorkflowMemoStatusNode = {
    displayName: memoDisplayName,
    phase,
    template: getMemoTemplateName(node),
    startedAt: startedAtDate,
    parameterMap,
    outputMap,
  };

  if (finishedAt != null) {
    const finishedAtDate = new Date(finishedAt);

    memoNode.finishedAt = finishedAtDate;
    memoNode.duration = formatDurationFromMs(
      finishedAtDate.getTime() - startedAtDate.getTime(),
    );
  }
  node.memo = memoNode;
}

function getMemoDisplayName(displayName: string) {
  if (displayName.endsWith(EXIT_NODE_SUFFIX)) {
    return EXIT_NODE_NAME;
  }
  return displayName;
}

function getMemoTemplateName(node: WorkflowStatusNode) {
  const { templateRef, templateName } = node;
  if (templateRef != null) {
    return templateRef.template;
  }

  if (templateName == null) {
    console.log("No template found for node");
    console.log(node);
    throw new ResourceEventMemoError(
      `No template found for node: ${node.displayName}`,
    );
  }

  const memoTemplateName = TemplateNameValues.find((templateNameValue) =>
    templateName.startsWith(templateNameValue),
  );

  if (memoTemplateName == null) {
    console.log(`Invalid template name ${templateName} for node`);
    console.log(node);
    throw new ResourceEventMemoError(
      `Invalid template name ${templateName} found for node: ${node.displayName}`,
    );
  }

  return memoTemplateName;
}

class ResourceEventMemoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export {
  getMemoDisplayName,
  memoizeFlow,
  memoizeWorkflow,
  memoizeWorkflowStatusNode,
};
