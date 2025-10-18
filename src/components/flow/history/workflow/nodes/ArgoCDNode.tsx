import { WorkflowGraphNode } from "src/components/flow/history/workflow/nodes/WorkflowGraphNode.tsx";
import styles from "src/components/flow/history/workflow/nodes/WorkflowGraphNode.module.css";

function ArgoCDNode() {
  return (
    <WorkflowGraphNode
      headerLink="https://google.com"
      titleIcon={`nf nf-md-kubernetes ${styles.k8sIcon}`}
      titleText="RESOURCE"
    >
      {null}
    </WorkflowGraphNode>
  );
}

export { ArgoCDNode };
