import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import { getRepoTreeLink } from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import { flowDefaults } from "src/data/data.ts";
import type {
  DockerBuildTestStep,
  DockerBuildTestPublishStep,
  Trigger,
} from "src/data/types.ts";
import { StepType } from "src/data/types.ts";

interface FlowGraphDockerStepProps {
  step: DockerBuildTestStep | DockerBuildTestPublishStep;
  trigger: Trigger;
}
function FlowGraphDockerStep({ step, trigger }: FlowGraphDockerStepProps) {
  const dockerfilePath = step.dockerfilePath ?? flowDefaults.dockerfilePath;
  const repoLink = getRepoLink(dockerfilePath, trigger);
  const displayEvent = getDisplayEvent(step);

  return (
    <FlowGraphNode>
      <a
        href={repoLink}
        target="_blank"
        rel="noreferrer"
        className={styles.nodeLink}
      >
        <i className={`nf nf-fa-docker ${styles.nodeIcon}`}></i>
        <div className={styles.nodeTextLine}>Dockerfile</div>
        <div className={styles.nodeTextLineBolder}>{displayEvent}</div>
      </a>
    </FlowGraphNode>
  );
}

function getRepoLink(dockerfilePath: string, trigger: Trigger) {
  const repoTreeLink = getRepoTreeLink(trigger.repoUrl, trigger.baseRef);
  return `${repoTreeLink}/${dockerfilePath}`;
}

function getDisplayEvent(
  step: DockerBuildTestStep | DockerBuildTestPublishStep,
) {
  switch (step.stepSource) {
    case StepType.DockerBuildTest:
      return "build";
    case StepType.DockerBuildTestPublish:
      return "publish";
    default:
      step satisfies never;
  }
}

export { FlowGraphDockerStep };
