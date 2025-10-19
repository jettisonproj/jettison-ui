import { useSearchParams } from "react-router";

import type {
  Workflow,
  WorkflowStatusNode,
} from "src/data/types/workflowTypes.ts";
import { NodeType } from "src/data/types/workflowTypes.ts";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import type {
  FlowNode,
  FlowEdge,
} from "src/components/flow/graph/FlowGraph.tsx";
import { WorkflowGraphNode } from "src/components/flow/history/nodes/WorkflowGraphNode.tsx";
import {
  isWorkflowGraphNode,
  TRIGGER_NODE_NAME,
} from "src/utils/workflowUtil.ts";
import { NODE_WIDTH } from "src/components/flow/flowComponentsUtil.tsx";

const NODE_HEIGHT = 39;

interface FlowHistoryWorkflowProps {
  workflow: Workflow;
}
function FlowHistoryWorkflow({ workflow }: FlowHistoryWorkflowProps) {
  const [searchParams] = useSearchParams();
  const selectedNode = searchParams.get("node");
  console.log("todo use selectedNode");
  console.log(selectedNode);

  // This component is rendered on the fly, so memoized access is not needed
  const { nodes: workflowNodesMap } = workflow.status;
  const { name: workflowName } = workflow.metadata;
  if (workflowNodesMap == null) {
    return <div>No workload data for {workflowName}</div>;
  }

  const workflowNodesArray = Object.values(workflowNodesMap)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .filter(isWorkflowGraphNode);

  const workflowGraphNodes = getWorkflowGraphNodes(workflowNodesArray);

  const workflowGraphEdges = getWorkflowGraphEdges(
    workflowNodesArray,
    workflowNodesMap,
    workflowName,
  );

  return (
    <FlowGraph flowNodes={workflowGraphNodes} flowEdges={workflowGraphEdges} />
  );
}

function getWorkflowGraphNodes(
  workflowNodesArray: WorkflowStatusNode[],
): FlowNode[] {
  return workflowNodesArray.map((node) => ({
    label: node.id,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    children: <WorkflowGraphNode node={node} />,
  }));
}

function getWorkflowGraphEdges(
  workflowNodesArray: WorkflowStatusNode[],
  workflowNodesMap: Record<string, WorkflowStatusNode>,
  workflowName: string,
): FlowEdge[] {
  let edgeIndex = 0;

  // First generate the native workflow edges
  const workflowGraphEdges = workflowNodesArray.flatMap((node) =>
    getEdgeDestinations(node.children, workflowNodesMap, workflowName).map(
      (edgeDestination) => ({
        label: `e${++edgeIndex}`,
        v: node.id,
        w: edgeDestination,
      }),
    ),
  );

  // Get nodes without dependencies
  const workflowNodesWithoutDeps = new Set(
    workflowNodesArray.map((node) => node.id),
  );
  for (const workflowGraphEdge of workflowGraphEdges) {
    const edgeDestination = workflowGraphEdge.w;
    workflowNodesWithoutDeps.delete(edgeDestination);
  }

  // Exclude the pseudo-trigger from the nodes without dependencies
  const triggerNode = workflowNodesArray.find(
    (node) => node.displayName === TRIGGER_NODE_NAME,
  );
  if (triggerNode == null) {
    throw new FlowHistoryWorkflowError(
      `workflow is missing trigger node: ${workflowName}`,
    );
  }
  workflowNodesWithoutDeps.delete(triggerNode.id);

  // Add edges from trigger node to nodes without dependencies
  workflowNodesWithoutDeps.forEach((workflowNodeWithoutDeps) => {
    workflowGraphEdges.push({
      label: `e${++edgeIndex}`,
      v: triggerNode.id,
      w: workflowNodeWithoutDeps,
    });
  });

  return workflowGraphEdges;
}

/**
 * In native workflow graphs, the children can be considered as the edge
 * destinations. However, since the "Container" subnodes are hidden, follow
 * these edges to connect to the next "Pod" node instead
 */
function getEdgeDestinations(
  initialChildren: string[] | undefined,
  workflowNodesMap: Record<string, WorkflowStatusNode>,
  workflowName: string,
) {
  const edgeDestinations: string[] = [];
  if (initialChildren == null) {
    return edgeDestinations;
  }

  const children = [...initialChildren];

  while (children.length > 0) {
    const child = children.pop();
    if (child == null) {
      // This should not occur due to check above
      throw new FlowHistoryWorkflowError(
        `empty child in workflow ${workflowName}`,
      );
    }

    const childNode = workflowNodesMap[child];
    if (childNode == null) {
      throw new FlowHistoryWorkflowError(
        `missing node ${child} in workflow ${workflowName}`,
      );
    }

    switch (childNode.type) {
      case NodeType.Skipped:
        edgeDestinations.push(child);
        break;
      case NodeType.Pod:
        edgeDestinations.push(child);
        break;
      case NodeType.Container:
        if (childNode.children == null) {
          break;
        }
        for (const subChild of childNode.children) {
          children.push(subChild);
        }
        break;
      case NodeType.DAG:
        throw new FlowHistoryWorkflowError(
          `unexpected DAG node edge ${child} in workflow ${workflowName}`,
        );
      default:
        childNode.type satisfies never;
        console.log("unexpected node type");
        console.log(childNode.type);
        throw new FlowHistoryWorkflowError(
          `unexpected node type for ${child} in workflow ${workflowName}`,
        );
    }
  }

  return edgeDestinations;
}

class FlowHistoryWorkflowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistoryWorkflow };
