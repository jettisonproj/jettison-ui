import { useSearchParams } from "react-router";

import type {
  Workflow,
  WorkflowStatusNode,
} from "src/data/types/workflowTypes.ts";
import { NodeType } from "src/data/types/workflowTypes.ts";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import { SelectedHistoryTabs } from "src/components/flow/history/selected/SelectedHistoryTabs.tsx";
import {
  Tab,
  DEFAULT_TAB,
} from "src/components/flow/history/selected/selectedHistoryTabData.ts";
import type {
  FlowNode,
  FlowEdge,
} from "src/components/flow/graph/FlowGraph.tsx";
import { WorkflowGraphNode } from "src/components/flow/history/selected/nodes/WorkflowGraphNode.tsx";
import {
  isWorkflowGraphNode,
  TRIGGER_NODE_NAME,
} from "src/utils/workflowUtil.ts";
import { NODE_WIDTH } from "src/components/flow/flowComponentsUtil.tsx";
import styles from "src/components/flow/history/selected/SelectedHistoryItem.module.css";

const NODE_HEIGHT = 39;

interface SelectedHistoryItemProps {
  workflow: Workflow;
  workflowBaseUrl: string;
}
function SelectedHistoryItem({
  workflow,
  workflowBaseUrl,
}: SelectedHistoryItemProps) {
  const [searchParams] = useSearchParams();
  const selectedNodeName = searchParams.get("node") ?? TRIGGER_NODE_NAME;
  const selectedTab = parseTab(searchParams.get("tab"));

  // This component is rendered on the fly, so memoized access is not needed
  const { nodes: workflowNodesMap } = workflow.status;
  const { name: workflowName } = workflow.metadata;
  if (workflowNodesMap == null) {
    return <div>No workload data for {workflowName}</div>;
  }

  const workflowNodesArray = Object.values(workflowNodesMap)
    .sort((a, b) => a.startedAt.localeCompare(b.startedAt))
    .filter(isWorkflowGraphNode);

  const workflowGraphNodes = getWorkflowGraphNodes(
    workflowNodesArray,
    workflowBaseUrl,
  );

  const workflowGraphEdges = getWorkflowGraphEdges(
    workflowNodesArray,
    workflowNodesMap,
    workflowName,
  );

  const selectedNode = workflowNodesArray.find(
    (node) => node.displayName === selectedNodeName,
  );
  if (selectedNode == null) {
    throw new SelectedHistoryItemError(
      `workflow ${workflowName} is missing selected node: ${selectedNodeName}`,
    );
  }

  const nodeBaseUrl = `${workflowBaseUrl}?node=${selectedNodeName}`;

  return (
    <div className={styles.selectedHistoryItem}>
      <FlowGraph
        flowNodes={workflowGraphNodes}
        flowEdges={workflowGraphEdges}
      />
      <SelectedHistoryTabs
        workflow={workflow}
        node={selectedNode}
        nodeBaseUrl={nodeBaseUrl}
        selectedTab={selectedTab}
      />
    </div>
  );
}

function getWorkflowGraphNodes(
  workflowNodesArray: WorkflowStatusNode[],
  workflowBaseUrl: string,
): FlowNode[] {
  return workflowNodesArray.map((node) => ({
    label: node.id,
    width: NODE_WIDTH,
    height: NODE_HEIGHT,
    children: (
      <WorkflowGraphNode node={node} workflowBaseUrl={workflowBaseUrl} />
    ),
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
    throw new SelectedHistoryItemError(
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
      throw new SelectedHistoryItemError(
        `empty child in workflow ${workflowName}`,
      );
    }

    const childNode = workflowNodesMap[child];
    if (childNode == null) {
      throw new SelectedHistoryItemError(
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
        throw new SelectedHistoryItemError(
          `unexpected ${NodeType.DAG} node edge ${child} in workflow ${workflowName}`,
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

class SelectedHistoryItemError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

function parseTab(tabValue: string | null) {
  if (tabValue == null) {
    return DEFAULT_TAB;
  }
  return Tab[tabValue as keyof typeof Tab];
}

export { SelectedHistoryItem };
