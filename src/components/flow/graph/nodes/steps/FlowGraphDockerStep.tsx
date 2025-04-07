import { Link } from "react-router";

import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import type {
  DockerBuildTestStep,
  DockerBuildTestPublishStep,
} from "src/data/types/flowTypes.ts";
import { getStepDetailsLink } from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import { StepSource } from "src/data/types/flowTypes.ts";

interface FlowGraphDockerStepProps {
  namespace: string;
  flowName: string;
  step: DockerBuildTestStep | DockerBuildTestPublishStep;
}
function FlowGraphDockerStep({
  namespace,
  flowName,
  step,
}: FlowGraphDockerStepProps) {
  const displayEvent = getDisplayEvent(step);
  const stepDetailsLink = getStepDetailsLink(namespace, flowName, step);

  return (
    <FlowGraphNode>
      <Link to={stepDetailsLink} className={styles.nodeLink} />
      <div className={styles.nodeContent}>
        <i
          className={`nf nf-fa-docker ${styles.nodeIcon} ${styles.dockerIcon}`}
        ></i>
        <div className={styles.nodeTextLine}>Dockerfile</div>
        <div className={styles.nodeTextLineBolder}>{displayEvent}</div>
      </div>
    </FlowGraphNode>
  );
}

function getDisplayEvent(
  step: DockerBuildTestStep | DockerBuildTestPublishStep,
) {
  switch (step.stepSource) {
    case StepSource.DockerBuildTest:
      return "build";
    case StepSource.DockerBuildTestPublish:
      return "publish";
    default:
      step satisfies never;
      console.log("unknown step");
      console.log(step);
  }
}

export { FlowGraphDockerStep };
