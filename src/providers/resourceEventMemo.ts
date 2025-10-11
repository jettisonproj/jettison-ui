import type { Flow, Trigger } from "src/data/types/flowTypes.ts";
import { TriggerSource } from "src/data/types/flowTypes.ts";
import type {
  Workflow,
  WorkflowMemoStatusNode,
} from "src/data/types/workflowTypes.ts";
import { formatDuration } from "src/utils/dateUtil.ts";

function memoizeFlow(flow: Flow) {
  const trigger = getFlowTrigger(flow);
  const isPrFlow = isPullRequestTrigger(trigger);

  flow.memo = { trigger, isPrFlow };
  return flow;
}

/* Get the trigger of the flow. Currently, exactly 1 trigger is expected */
function getFlowTrigger(flow: Flow): Trigger {
  const { triggers } = flow.spec;
  if (triggers.length !== 1) {
    throw new MemoizeError(
      `expected 1 Flow trigger but got: ${triggers.length}`,
    );
  }
  const trigger = triggers[0];
  if (!trigger) {
    throw new MemoizeError(`expected Flow trigger but got: ${trigger}`);
  }
  return trigger;
}

/* Get whether the flow is a PR flow, based on the trigger type */
function isPullRequestTrigger(trigger: Trigger) {
  switch (trigger.triggerSource) {
    case TriggerSource.GitHubPush:
      return false;
    case TriggerSource.GitHubPullRequest:
      return true;
    default:
      trigger satisfies never;
      console.log("unknown trigger");
      console.log(trigger);
      return false;
  }
}

function memoizeWorkflow(workflow: Workflow) {
  // Memoize or re-key the node status using the displayName
  // Also convert dates to Date type and add duration
  const nodes: Record<string, WorkflowMemoStatusNode> = {};
  const sortedNodes: WorkflowMemoStatusNode[] = [];
  if (workflow.status.nodes != null) {
    Object.values(workflow.status.nodes).forEach((node) => {
      const { displayName, phase, startedAt, finishedAt, inputs, outputs } =
        node;

      const parameterMap: Record<string, string> = {};
      inputs?.parameters.forEach((parameter) => {
        parameterMap[parameter.name] = parameter.value;
      });

      const outputMap: Record<string, string> = {};
      outputs?.parameters?.forEach((parameter) => {
        outputMap[parameter.name] = parameter.value;
      });

      const startedAtDate = new Date(startedAt);

      const memoNode: WorkflowMemoStatusNode = {
        displayName,
        phase,
        startedAt: startedAtDate,
        parameterMap,
        outputMap,
      };
      if (finishedAt != null) {
        const finishedAtDate = new Date(finishedAt);

        memoNode.finishedAt = finishedAtDate;
        memoNode.duration = formatDuration(
          finishedAtDate.getTime() - startedAtDate.getTime(),
        );
      }
      nodes[node.displayName] = memoNode;
      sortedNodes.push(memoNode);
    });
  }

  // Memoize the sorted nodes by startedAt
  sortedNodes.sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());

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
    sortedNodes,
  };

  // Memoize the finishedAt string to a Date. Also, memoize the duration
  const finishedAt = workflow.status.finishedAt;
  if (finishedAt != null) {
    const finishedAtDate = new Date(finishedAt);

    workflow.memo.finishedAt = finishedAtDate;
    workflow.memo.duration = formatDuration(
      finishedAtDate.getTime() - startedAt.getTime(),
    );
  }
}

class MemoizeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { memoizeFlow, memoizeWorkflow };
