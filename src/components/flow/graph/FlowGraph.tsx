import dagre from "@dagrejs/dagre";
import type { GraphEdge, Node } from "@dagrejs/dagre";
import { ReactNode } from "react";

import styles from "src/components/flow/graph/FlowGraph.module.css";

/* Describes the node input used for generating a graph */
interface FlowNode {
  label: string;
  width: number;
  height: number;
  children: ReactNode;
}

/* Describes the edge input used for generating a graph */
interface FlowEdge {
  v: string;
  w: string;
  label: string;
}

/**
 * Return a new Dagre Graph with layout details
 * for the specfied nodes and edges
 */
function getDagreGraph(nodes: FlowNode[], edges: FlowEdge[]) {
  // Create a new directed graph
  const dagreGraph = new dagre.graphlib.Graph<FlowNode>();

  // Set an empty object for the graph label
  dagreGraph.setGraph({ rankdir: "LR" });

  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node. In this case we're going to add labels to each of
  // our nodes.
  for (const node of nodes) {
    dagreGraph.setNode(node.label, node);
  }

  // Add edges to the graph.
  for (const edge of edges) {
    const { v, w, label } = edge;
    dagreGraph.setEdge(v, w, { label });
  }

  // Update graph with layout info
  dagre.layout(dagreGraph);

  return dagreGraph;
}

interface FlowGraphProps {
  flowNodes: FlowNode[];
  flowEdges: FlowEdge[];
}
function FlowGraph({ flowNodes, flowEdges }: FlowGraphProps) {
  // Create a new dagre graph with layout details (e.g positions, width)
  const dagreGraph = getDagreGraph(flowNodes, flowEdges);

  // Get the graph, node, and edge layout components
  const graphLabels = dagreGraph.graph();
  const nodeLabels = dagreGraph
    .nodes()
    .map((nodeId) => dagreGraph.node(nodeId));
  const edgeLabels = dagreGraph
    .edges()
    .map((edgeId) => dagreGraph.edge(edgeId));

  const { width, height } = graphLabels;
  if (width == null || height == null) {
    throw new FlowGraphError(
      `invalid dagre graph: width=${width} or height=${height}`,
    );
  }

  /* Since the graph may overflow slightly (e.g. from using stroke-width),
   * add padding to avoid the overflow */
  const padding = 10;
  const totalWidth = width + 2 * padding;
  const totalHeight = height + 2 * padding;

  return (
    <div className={styles.graphContainer}>
      <svg
        width={totalWidth}
        height={totalHeight}
        viewBox={`0 0 ${totalWidth} ${totalHeight}`}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g transform={`translate(${padding}, ${padding})`}>
          {nodeLabels.map((nodeLabel) => (
            <FlowGraphNode key={nodeLabel.label} nodeLabel={nodeLabel} />
          ))}
          {edgeLabels.map((edgeLabel) => (
            // The edgeLabel should contain the FlowEdge fields,
            // so cast the "label" field
            <FlowGraphEdge
              key={edgeLabel.label as string}
              edgeLabel={edgeLabel}
            />
          ))}
        </g>
      </svg>
    </div>
  );
}

interface FlowGraphNodeProps {
  nodeLabel: Node<FlowNode>;
}
function FlowGraphNode({ nodeLabel }: FlowGraphNodeProps) {
  const { width, height, x, y, children } = nodeLabel;
  // Since (x, y) is at the center of the node, calculate the left x (lx)
  // and top y (ty) for use with rect
  const lx = x - width / 2;
  const ty = y - height / 2;
  const borderRadius = 5;
  return (
    <>
      <rect
        width={width}
        height={height}
        x={lx}
        y={ty}
        rx={borderRadius}
        ry={borderRadius}
        className={styles.node}
      />
      <foreignObject width={width} height={height} x={lx} y={ty}>
        {children}
      </foreignObject>
    </>
  );
}

interface FlowGraphEdgeProps {
  edgeLabel: GraphEdge;
}
function FlowGraphEdge({ edgeLabel }: FlowGraphEdgeProps) {
  const { points } = edgeLabel;
  const [startPoint, centerPoint, endPoint] = points;
  if (startPoint == null || centerPoint == null || endPoint == null) {
    throw new FlowGraphError("invalid dagre edgeLabel: point was null");
  }
  const { x: sx, y: sy } = startPoint;
  const { x: cx, y: cy } = centerPoint;
  const { x: ex, y: ey } = endPoint;
  return (
    <path
      d={`M ${sx},${sy} L ${cx},${cy} L ${ex},${ey}`}
      className={styles.edge}
    />
  );
}

class FlowGraphError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowGraph };
export type { FlowEdge, FlowNode };
