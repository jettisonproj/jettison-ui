import { WorkflowGraphNode } from "src/components/flow/history/workflow/nodes/WorkflowGraphNode.tsx";
import styles from "src/components/flow/history/workflow/nodes/WorkflowGraphNode.module.css";

function GitHubCheckStartNode() {
  return (
    <WorkflowGraphNode
      headerLink="https://google.com"
      titleIcon={`nf nf-fa-github ${styles.githubIcon}`}
      titleText="PUSH?"
    >
      {null}
    </WorkflowGraphNode>
  );
}
export { GitHubCheckStartNode };
