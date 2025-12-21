import type { WorkflowGraphNodeProps } from "src/components/flow/history/selected/nodes/WorkflowGraphNodeBase.ts";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import { getDisplayRepoPath } from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import { getResourcePath } from "src/utils/workflowUtil.ts";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";

function ArgoCDNode({ node, workflowBaseUrl }: WorkflowGraphNodeProps) {
  const resourcePath = getResourcePath(node.inputs?.parameters);
  return (
    <FlowGraphNode
      headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
      titleIcon={`nf nf-md-kubernetes ${styles.k8sIcon}`}
      titleText={getDisplayRepoPath(resourcePath, resourcePath)}
    />
  );
}

export { ArgoCDNode };
