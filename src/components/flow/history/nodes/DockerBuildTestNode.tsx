import type { WorkflowGraphNodeProps } from "src/components/flow/history/nodes/WorkflowGraphNodeBase.ts";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import { BUILD_DISPLAY_NAME } from "src/utils/flowUtil.ts";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";

function DockerBuildTestNode({
  node,
  workflowBaseUrl,
}: WorkflowGraphNodeProps) {
  return (
    <FlowGraphNode
      headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
      titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
      titleText={BUILD_DISPLAY_NAME}
    />
  );
}
export { DockerBuildTestNode };
