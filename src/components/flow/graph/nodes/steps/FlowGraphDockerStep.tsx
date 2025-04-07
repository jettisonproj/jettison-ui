import { Link } from "react-router";

import type { Trigger } from "src/data/types/flowTypes.ts";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import { flowDefaults } from "src/data/data.ts";
import { getRepoPathLink } from "src/utils/gitUtil.ts";
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
  trigger: Trigger;
}
function FlowGraphDockerStep({
  namespace,
  flowName,
  step,
  trigger,
}: FlowGraphDockerStepProps) {
  const displayEvent = getDisplayEvent(step);
  const stepDetailsLink = getStepDetailsLink(namespace, flowName, step);

  const dockerfilePath = step.dockerfilePath ?? flowDefaults.dockerfilePath;
  const repoLink = getRepoPathLink(
    trigger.repoUrl,
    trigger.baseRef,
    dockerfilePath,
  );
  return (
    <FlowGraphNode>
      <Link to={stepDetailsLink} className={styles.nodeLink} />
      <div className={styles.nodeContent}>
        <i
          className={`nf nf-fa-docker ${styles.nodeIcon} ${styles.dockerIcon}`}
        ></i>
        <a
          className={styles.nodeTextLink}
          href={repoLink}
          target="_blank"
          rel="noreferrer"
        >
          Dockerfile
        </a>
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
