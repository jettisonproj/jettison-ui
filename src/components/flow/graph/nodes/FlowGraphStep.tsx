import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";

function FlowGraphStep() {
  return (
    <FlowGraphNode>
      <i className="fa fa-user-o"></i> Step
    </FlowGraphNode>
  );
}

export { FlowGraphStep };
