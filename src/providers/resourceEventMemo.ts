import type { Flow } from "src/data/types/flowTypes.ts";
import type {
  Workflow,
  WorkflowMemoStatusNode,
  WorkflowStatusNode,
} from "src/data/types/workflowTypes.ts";
import { formatDurationFromMs } from "src/utils/dateUtil.ts";
import { getFlowTrigger, isPullRequestTrigger } from "src/utils/flowUtil.ts";
import {
  EXIT_NODE_NAME,
  EXIT_NODE_SUFFIX,
  isMemoizedNode,
  TRIGGER_NODE_NAME,
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
  const {
    displayName,
    phase,
    templateRef,
    startedAt,
    finishedAt,
    inputs,
    outputs,
  } = node;

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
    templateRef,
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

function workflowMemoNodeCompareFn(
  a: WorkflowMemoStatusNode,
  b: WorkflowMemoStatusNode,
) {
  // Ensure trigger nodes come first
  if (a.displayName === TRIGGER_NODE_NAME) {
    return -1;
  }
  if (b.displayName === TRIGGER_NODE_NAME) {
    return 1;
  }
  // Then, order by time
  return a.startedAt.getTime() - b.startedAt.getTime();
}

function getMemoDisplayName(displayName: string) {
  if (displayName.endsWith(EXIT_NODE_SUFFIX)) {
    return EXIT_NODE_NAME;
  }
  return displayName;
}

export {
  getMemoDisplayName,
  memoizeFlow,
  memoizeWorkflow,
  memoizeWorkflowStatusNode,
  workflowMemoNodeCompareFn,
};
