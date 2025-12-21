import type { WorkflowGraphNodeProps } from "src/components/flow/history/selected/nodes/WorkflowGraphNodeBase.ts";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import { getTriggerDisplayName } from "src/utils/workflowUtil.ts";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";

function GitHubCheckStartNode({
  node,
  workflowBaseUrl,
}: WorkflowGraphNodeProps) {
  const triggerDisplayName = getTriggerDisplayName(node.inputs?.parameters);
  return (
    <FlowGraphNode
      headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
      titleIcon={`nf nf-fa-github ${styles.githubIcon}`}
      titleText={triggerDisplayName}
    />
  );
}

export { GitHubCheckStartNode };
