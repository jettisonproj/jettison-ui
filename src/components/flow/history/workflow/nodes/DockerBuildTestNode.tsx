import { WorkflowGraphNode } from "src/components/flow/history/workflow/nodes/WorkflowGraphNode.tsx";
import styles from "src/components/flow/history/workflow/nodes/WorkflowGraphNode.module.css";

function DockerBuildTestNode() {
  return (
    <WorkflowGraphNode
      headerLink="https://google.com"
      titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
      titleText="BUILD"
    >
      {null}
    </WorkflowGraphNode>
  );
}
export { DockerBuildTestNode };
