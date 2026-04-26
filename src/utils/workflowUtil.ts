import { flowDefaultStepName } from "src/data/data.ts";
import type { Step } from "src/data/types/flowTypes.ts";
import type {
  NodeType,
  Workflow,
  WorkflowMemoStatusNode,
  WorkflowPhase,
  WorkflowSpecParameter,
  WorkflowStatusNode,
} from "src/data/types/workflowTypes.ts";
import {
  NodePhases,
  NodeTypes,
  WorkflowPhases,
} from "src/data/types/workflowTypes.ts";
import { PR_DISPLAY_NAME, PUSH_DISPLAY_NAME } from "src/utils/flowUtil.ts";

const TRIGGER_NODE_NAME = "github-check-start";
const EXIT_NODE_NAME = "on-exit";
const EXIT_NODE_SUFFIX = ".onExit";

const NODE_PARAM_EVENT_TYPE = "event-type";
const NODE_PARAM_RESOURCE_PATH = "resource-path";

/**
 * Determines whether a workflow node should be memoized.
 *
 * Not all workflow nodes need to be memoized, since some nodes are
 * only used on demand
 */
function isMemoizedNode(nodeType: NodeType) {
  switch (nodeType) {
    // Pods are either a Flow step/trigger or github status check
    case NodeTypes.Pod:
      return true;
    // Skipped nodes should be Pods. todo confirm this
    case NodeTypes.Skipped:
      return true;
    case NodeTypes.Container:
      // Containers are considered subtasks and do not map to a Flow step/trigger
      return false;
    case NodeTypes.DAG:
      // DAG is the top level workflow node and does not map to a Flow step/trigger
      return false;
    default:
      nodeType satisfies never;
      console.log("unexpected node type in workflow");
      console.log(nodeType);
      throw new InvalidNodeError(`unexpected node type in workflow`);
  }
}

/**
 * Determines whether to render the node as part of the workflow graph
 *
 * Excludes the "onExit" node which is not rendered in the flow graph
 */
function isWorkflowGraphNode(node: WorkflowStatusNode) {
  return (
    isMemoizedNode(node.type) && !node.displayName.endsWith(EXIT_NODE_SUFFIX)
  );
}

/**
 * Get the number of active workflows
 * Return 0 when the workflows are still loading (null) or when
 * the workflows are empty (undefined)
 */
function getNumActiveWorkflows(
  workflows: Map<string, Workflow> | null | undefined,
) {
  if (workflows == null) {
    return 0;
  }
  let numActiveWorkflows = 0;
  for (const workflow of workflows.values()) {
    if (isWorkflowActive(workflow.status.phase)) {
      numActiveWorkflows += 1;
    }
  }
  return numActiveWorkflows;
}

function isWorkflowActive(workflowPhase: WorkflowPhase | undefined) {
  return (
    workflowPhase == null ||
    workflowPhase === WorkflowPhases.Pending ||
    workflowPhase === WorkflowPhases.Running ||
    workflowPhase === WorkflowPhases.Unknown
  );
}

//
// Contains functions to get workflow or workflow node parameters
// Should be kept in sync with:
// - https://github.com/jettisonproj/jettison-controller/blob/main/internal/controller/sensor/sensor_trigger_parameters.go
// - https://github.com/jettisonproj/jettison-controller/blob/main/internal/workflowtemplates/workflowtemplates.go
//
function getWorkflowRepo(parameterMap: Record<string, string>) {
  return getFromParameterMap(parameterMap, "repo");
}

function getWorkflowRevision(parameterMap: Record<string, string>) {
  return getFromParameterMap(parameterMap, "revision");
}

function getWorkflowRevisionRef(parameterMap: Record<string, string>) {
  return getFromParameterMap(parameterMap, "revision-ref");
}

function getWorkflowRevisionTitle(parameterMap: Record<string, string>) {
  return getFromParameterMap(parameterMap, "revision-title");
}

function getWorkflowRevisionAuthor(parameterMap: Record<string, string>) {
  return getFromParameterMap(parameterMap, "revision-author");
}

// PR parameter
function getWorkflowRevisionNumber(parameterMap: Record<string, string>) {
  return getFromParameterMap(parameterMap, "revision-number");
}

// Workflow memo node parameters
function getNodeDockerfilePath(parameterMap: Record<string, string>) {
  return getFromParameterMap(parameterMap, "dockerfile-path");
}

function getMemoResourcePath(parameterMap: Record<string, string>) {
  return getFromParameterMap(parameterMap, NODE_PARAM_RESOURCE_PATH);
}

function getMemoTriggerDisplayName(parameterMap: Record<string, string>) {
  const eventType = getFromParameterMap(parameterMap, NODE_PARAM_EVENT_TYPE);
  return getTriggerDisplayNameFromEventType(eventType);
}

// Workflow node parameters
function getNodeResourcePath(parameters: WorkflowSpecParameter[] | undefined) {
  return getFromParameterArray(parameters, NODE_PARAM_RESOURCE_PATH);
}

function getNodeTriggerDisplayName(
  parameters: WorkflowSpecParameter[] | undefined,
) {
  const eventType = getFromParameterArray(parameters, NODE_PARAM_EVENT_TYPE);
  return getTriggerDisplayNameFromEventType(eventType);
}

function getFromParameterMap(
  parameterMap: Record<string, string>,
  parameterKey: string,
) {
  const parameterValue = parameterMap[parameterKey];
  if (parameterValue == null) {
    throw new InvalidNodeError(
      `did not find ${parameterKey} in workflow parameter map`,
    );
  }
  return parameterValue;
}

function getFromParameterArray(
  parameters: WorkflowSpecParameter[] | undefined,
  parameterKey: string,
) {
  const parameter = parameters?.find((param) => param.name === parameterKey);
  if (parameter == null) {
    throw new InvalidNodeError(
      `did not find ${parameterKey} in parameter array`,
    );
  }
  return parameter.value;
}

function getTriggerDisplayNameFromEventType(eventType: string) {
  switch (eventType) {
    case "PR":
      return PR_DISPLAY_NAME;
    case "commit":
      return PUSH_DISPLAY_NAME;
    default:
      throw new InvalidNodeError(`invalid event type for node: ${eventType}`);
  }
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

function workflowCompareFn(a: Workflow, b: Workflow) {
  const bDate = b.memo.startedAt;
  const aDate = a.memo.startedAt;
  if (bDate == null && aDate == null) {
    return 0;
  }
  if (bDate == null) {
    return 1;
  }
  if (aDate == null) {
    return -1;
  }
  return bDate.getTime() - aDate.getTime();
}

class InvalidNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export {
  EXIT_NODE_NAME,
  EXIT_NODE_SUFFIX,
  getLastWorkflowNodeForStep,
  getLastWorkflowNodeForTrigger,
  getMemoResourcePath,
  getMemoTriggerDisplayName,
  getNodeDockerfilePath,
  getNodeResourcePath,
  getNodeTriggerDisplayName,
  getNumActiveWorkflows,
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionNumber,
  getWorkflowRevisionRef,
  getWorkflowRevisionTitle,
  InvalidNodeError,
  isMemoizedNode,
  isWorkflowGraphNode,
  TRIGGER_NODE_NAME,
  workflowCompareFn,
};

export type { WorkflowNode };
