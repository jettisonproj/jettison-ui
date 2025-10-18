import { NodeType } from "src/data/types/workflowTypes.ts";
import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";

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
      throw new InvalidNodeTypeError(`unexpected node type in workflow`);
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

class InvalidNodeTypeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { isMemoizedNode, isWorkflowGraphNode, TRIGGER_NODE_NAME };
