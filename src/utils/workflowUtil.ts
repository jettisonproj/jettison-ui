import {
  NodeType,
  WorkflowSpecParameter,
} from "src/data/types/workflowTypes.ts";
import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";
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
    case NodeType.Pod:
      return true;
    // Skipped nodes should be Pods. todo confirm this
    case NodeType.Skipped:
      return true;
    case NodeType.Container:
      // Containers are considered subtasks and do not map to a Flow step/trigger
      return false;
    case NodeType.DAG:
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

class InvalidNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export {
  isMemoizedNode,
  isWorkflowGraphNode,
  TRIGGER_NODE_NAME,
  EXIT_NODE_NAME,
  EXIT_NODE_SUFFIX,
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionRef,
  getWorkflowRevisionTitle,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionNumber,
  getNodeDockerfilePath,
  getNodeResourcePath,
  getNodeTriggerDisplayName,
  getMemoTriggerDisplayName,
  getMemoResourcePath,
};
