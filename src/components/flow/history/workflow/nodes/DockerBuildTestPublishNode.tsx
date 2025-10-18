import { WorkflowGraphNode } from "src/components/flow/history/workflow/nodes/WorkflowGraphNode.tsx";
import styles from "src/components/flow/history/workflow/nodes/WorkflowGraphNode.module.css";

function DockerBuildTestPublishNode() {
  return (
    <WorkflowGraphNode
      headerLink="https://google.com"
      titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
      titleText="PUBLISH"
    >
      {null}
    </WorkflowGraphNode>
  );
}
export { DockerBuildTestPublishNode };
