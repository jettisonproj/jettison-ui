import type { JSX } from "react";
import { useSearchParams } from "react-router";

import { NODE_WIDTH } from "src/components/flow/flowComponentsUtil.tsx";
import type {
  FlowEdge,
  FlowNode,
} from "src/components/flow/graph/FlowGraph.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import styles from "src/components/flow/history/selected/SelectedHistoryItem.module.css";
import { SelectedHistoryTabs } from "src/components/flow/history/selected/SelectedHistoryTabs.tsx";
import { WorkflowGraphNode } from "src/components/flow/history/selected/nodes/WorkflowGraphNode.tsx";
import { WorkflowPendingGraphNode } from "src/components/flow/history/selected/nodes/WorkflowPendingGraphNode.tsx";
import { getSelectedTab } from "src/components/flow/history/selected/selectedHistoryTabData.ts";
import { flowDefaultStepName } from "src/data/data.ts";
import type { Step } from "src/data/types/flowTypes.ts";
import type {
  Workflow,
  WorkflowStatusNode,
} from "src/data/types/workflowTypes.ts";
import { NodeTypes } from "src/data/types/workflowTypes.ts";
import { getMemoDisplayName } from "src/providers/resourceEventMemo.ts";
import {
  EXIT_NODE_NAME,
  isWorkflowGraphNode,
  TRIGGER_NODE_NAME,
} from "src/utils/workflowUtil.ts";

const NODE_HEIGHT = 39;

interface SelectedHistoryItemProps {
  flowSteps: Step[];
  workflow: Workflow;
  workflowBaseUrl: string;
}
function SelectedHistoryItem({
  flowSteps,
  workflow,
  workflowBaseUrl,
}: SelectedHistoryItemProps): JSX.Element {
  const [searchParams] = useSearchParams();
  const selectedNodeName = searchParams.get("node") ?? TRIGGER_NODE_NAME;
  const selectedTab = getSelectedTab(searchParams.get("tab"));

  // This component is rendered on the fly, so no need to memoize data for this
  // component. Instead, use the raw data to compute the derived data here.
  const { nodes: workflowNodesMap } = workflow.status;
  const { name: workflowName } = workflow.metadata;
  if (workflowNodesMap == null) {
    return <div>No workload data for {workflowName}</div>;
  }

  // Use memoDisplayName instead of displayName to align with the flow step naming
  const workflowNodesByDisplayName: Record<string, WorkflowStatusNode> = {};
  const workflowNodesById: Record<string, WorkflowStatusNode> = {};
  const workflowNodesValues = Object.values(workflowNodesMap);
  workflowNodesValues.forEach((workflowNode) => {
    const memoDisplayName = getMemoDisplayName(workflowNode.displayName);
    const workflowMemoNode = {
      ...workflowNode,
      displayName: memoDisplayName,
    };

    workflowNodesByDisplayName[memoDisplayName] = workflowMemoNode;
    workflowNodesById[workflowMemoNode.id] = workflowMemoNode;
  });

  const selectedNode = workflowNodesByDisplayName[selectedNodeName];

  // The workflow nodes might not exist yet. Use the flow step to represent
  // the nodes pending creation
  const nodesPendingCreation = flowSteps.filter(
    (flowStep) =>
      workflowNodesByDisplayName[flowDefaultStepName(flowStep)] == null,
  );

  if (
    selectedNode == null &&
    selectedNodeName !== EXIT_NODE_NAME &&
    !isSelectedNodePendingCreation(selectedNodeName, nodesPendingCreation)
  ) {
    throw new SelectedHistoryItemError(
      `workflow ${workflowName} is missing selected node: ${selectedNodeName}`,
    );
  }

  // Filter out DAG and sub-nodes, to avoid rendering them in the Graph
  const workflowNodesToRender = workflowNodesValues
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .filter(isWorkflowGraphNode);

  const workflowGraphNodes = getWorkflowGraphNodes(
    workflowNodesToRender,
    workflowBaseUrl,
    selectedNodeName,
    nodesPendingCreation,
  );

  const workflowGraphEdges = getWorkflowGraphEdges(
    workflowNodesToRender,
    workflowNodesById,
    workflowName,
    nodesPendingCreation,
  );

  const nodeBaseUrl = `${workflowBaseUrl}?node=${selectedNodeName}`;

  return (
    <div className={styles.selectedHistoryItem}>
      <FlowGraph
        flowNodes={workflowGraphNodes}
        flowEdges={workflowGraphEdges}
      />
      <SelectedHistoryTabs
        workflow={workflow}
        selectedNodeName={selectedNodeName}
        selectedNode={selectedNode}
        nodeBaseUrl={nodeBaseUrl}
        selectedTab={selectedTab}
        queryPrefix="&"
      />
    </div>
  );
}

function getWorkflowGraphNodes(
  workflowNodesToRender: WorkflowStatusNode[],
  workflowBaseUrl: string,
  selectedNodeName: string,
  nodesPendingCreation: Step[],
): FlowNode[] {
  const workflowGraphNodes = workflowNodesToRender.map((node) => ({
    label: node.displayName,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    children: (
      <WorkflowGraphNode
        node={node}
        workflowBaseUrl={workflowBaseUrl}
        isSelected={node.displayName === selectedNodeName}
      />
    ),
  }));

  const workflowPendingGraphNodes = nodesPendingCreation.map(
    (nodePendingCreation) => ({
      label: flowDefaultStepName(nodePendingCreation),
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      children: (
        <WorkflowPendingGraphNode
          nodePendingCreation={nodePendingCreation}
          workflowBaseUrl={workflowBaseUrl}
          isSelected={
            flowDefaultStepName(nodePendingCreation) === selectedNodeName
          }
        />
      ),
    }),
  );
  return workflowGraphNodes.concat(workflowPendingGraphNodes);
}

function getWorkflowGraphEdges(
  workflowNodesToRender: WorkflowStatusNode[],
  workflowNodesById: Record<string, WorkflowStatusNode>,
  workflowName: string,
  nodesPendingCreation: Step[],
): FlowEdge[] {
  let edgeIndex = 0;

  // First generate the native workflow edges
  const workflowGraphEdges = workflowNodesToRender.flatMap((node) =>
    getEdgeDestinations(node.children, workflowNodesById, workflowName).map(
      (edgeDestination) => ({
        label: `e${(++edgeIndex).toString()}`,
        v: node.displayName,
        w: edgeDestination,
      }),
    ),
  );

  // Get nodes without dependencies
  const workflowNodesWithoutDeps = new Set(
    workflowNodesToRender.map((node) => node.displayName),
  );
  for (const workflowGraphEdge of workflowGraphEdges) {
    const edgeDestination = workflowGraphEdge.w;
    workflowNodesWithoutDeps.delete(edgeDestination);
  }

  // Exclude the pseudo-trigger from the nodes without dependencies
  const triggerNode = workflowNodesToRender.find(
    (node) => node.displayName === TRIGGER_NODE_NAME,
  );
  if (triggerNode == null) {
    throw new SelectedHistoryItemError(
      `workflow is missing trigger node: ${workflowName}`,
    );
  }
  workflowNodesWithoutDeps.delete(triggerNode.displayName);

  // Add edges from trigger node to nodes without dependencies
  workflowNodesWithoutDeps.forEach((workflowNodeWithoutDeps) => {
    workflowGraphEdges.push({
      label: `e${(++edgeIndex).toString()}`,
      v: triggerNode.displayName,
      w: workflowNodeWithoutDeps,
    });
  });

  const pendingGraphEdges = nodesPendingCreation.flatMap(
    (nodePendingCreation) => {
      if (
        nodePendingCreation.dependsOn == null ||
        nodePendingCreation.dependsOn.length === 0
      ) {
        return [
          {
            label: `e${(++edgeIndex).toString()}`,
            v: triggerNode.displayName,
            w: flowDefaultStepName(nodePendingCreation),
          },
        ];
      }
      return nodePendingCreation.dependsOn.map((dep) => ({
        label: `e${(++edgeIndex).toString()}`,
        v: dep,
        w: flowDefaultStepName(nodePendingCreation),
      }));
    },
  );

  return workflowGraphEdges.concat(pendingGraphEdges);
}

/**
 * In native workflow graphs, the children can be considered as the edge
 * destinations. However, since the "Container" subnodes are hidden, follow
 * these edges to connect to the next "Pod" node instead
 */
function getEdgeDestinations(
  initialChildren: string[] | undefined,
  workflowNodesById: Record<string, WorkflowStatusNode>,
  workflowName: string,
): string[] {
  const edgeDestinations: string[] = [];
  if (initialChildren == null) {
    return edgeDestinations;
  }

  const children = [...initialChildren];

  while (children.length > 0) {
    const child = children.pop();
    if (child == null) {
      // This should not occur due to check above
      throw new SelectedHistoryItemError(
        `empty child in workflow ${workflowName}`,
      );
    }

    const childNode = workflowNodesById[child];
    if (childNode == null) {
      throw new SelectedHistoryItemError(
        `missing node ${child} in workflow ${workflowName}`,
      );
    }

    switch (childNode.type) {
      case NodeTypes.Skipped:
        edgeDestinations.push(childNode.displayName);
        break;
      case NodeTypes.Pod:
        edgeDestinations.push(childNode.displayName);
        break;
      case NodeTypes.Container:
        if (childNode.children == null) {
          break;
        }
        for (const subChild of childNode.children) {
          children.push(subChild);
        }
        break;
      case NodeTypes.DAG:
        throw new SelectedHistoryItemError(
          `unexpected ${NodeTypes.DAG} node edge ${child} in workflow ${workflowName}`,
        );
      default:
        childNode.type satisfies never;
        console.log("unexpected node type");
        console.log(childNode.type);
        throw new SelectedHistoryItemError(
          `unexpected node type for ${child} in workflow ${workflowName}`,
        );
    }
  }

  return edgeDestinations;
}

function isSelectedNodePendingCreation(
  selectedNodeName: string,
  nodesPendingCreation: Step[],
): boolean {
  return nodesPendingCreation.some(
    (nodePendingCreation) =>
      flowDefaultStepName(nodePendingCreation) === selectedNodeName,
  );
}

class SelectedHistoryItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { SelectedHistoryItem };
