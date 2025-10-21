import type { WorkflowGraphNodeProps } from "src/components/flow/history/nodes/WorkflowGraphNodeBase.ts";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import { PUBLISH_DISPLAY_NAME } from "src/utils/flowUtil.ts";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";

function DockerBuildTestPublishNode({
  node,
  workflowBaseUrl,
}: WorkflowGraphNodeProps) {
  return (
    <FlowGraphNode
      headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
      titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
      titleText={PUBLISH_DISPLAY_NAME}
    />
  );
}
export { DockerBuildTestPublishNode };
