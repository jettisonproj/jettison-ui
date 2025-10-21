import {
  NodeType,
  WorkflowSpecParameter,
} from "src/data/types/workflowTypes.ts";
import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";
import { PR_DISPLAY_NAME, PUSH_DISPLAY_NAME } from "src/utils/flowUtil.ts";

const TRIGGER_NODE_NAME = "github-check-start";
const EXIT_NODE_SUFFIX = ".onExit";

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

class InvalidNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

//
// Contains functions to get workflow or workflow node parameters
// Should be kept in sync with:
// - https://github.com/jettisonproj/jettison-controller/blob/main/internal/controller/sensor/sensor_trigger_parameters.go
//
function getWorkflowRepo(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "repo");
}

function getWorkflowRevision(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "revision");
}

function getWorkflowRevisionRef(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "revision-ref");
}

function getWorkflowRevisionTitle(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "revision-title");
}

function getWorkflowRevisionAuthor(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "revision-author");
}

// PR parameter
function getWorkflowRevisionNumber(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "revision-number");
}

// Workflow node parameters
function getNodeDockerfilePath(parameterMap: Record<string, string>) {
  return getWorkflowParameter(parameterMap, "dockerfile-path");
}

function getWorkflowParameter(
  parameterMap: Record<string, string>,
  parameterKey: string,
) {
  const parameterValue = parameterMap[parameterKey];
  if (parameterValue == null) {
    throw new InvalidNodeError(
      `did not find ${parameterKey} in workflow parameters`,
    );
  }
  return parameterValue;
}

//
// Contains functions to get workflow or workflow node parameters
// Should be kept in sync with:
// - https://github.com/jettisonproj/jettison-controller/blob/main/internal/workflowtemplates/workflowtemplates.go
//
function getResourcePath(parameters: WorkflowSpecParameter[] | undefined) {
  return getNodeParameter(parameters, "resource-path");
}

function getTriggerDisplayName(
  parameters: WorkflowSpecParameter[] | undefined,
) {
  const eventType = getNodeParameter(parameters, "event-type");
  switch (eventType) {
    case "PR":
      return PR_DISPLAY_NAME;
    case "commit":
      return PUSH_DISPLAY_NAME;
    default:
      throw new InvalidNodeError(`invalid event type for node: ${eventType}`);
  }
}

function getNodeParameter(
  parameters: WorkflowSpecParameter[] | undefined,
  parameterKey: string,
) {
  const parameter = parameters?.find((param) => param.name === parameterKey);
  if (parameter == null) {
    throw new InvalidNodeError(
      `did not find ${parameterKey} in node parameters`,
    );
  }
  return parameter.value;
}

export {
  isMemoizedNode,
  isWorkflowGraphNode,
  TRIGGER_NODE_NAME,
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionRef,
  getWorkflowRevisionTitle,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionNumber,
  getNodeDockerfilePath,
  getResourcePath,
  getTriggerDisplayName,
};
