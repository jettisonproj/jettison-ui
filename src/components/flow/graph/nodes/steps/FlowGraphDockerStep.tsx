import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
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
  // todo should have repo link in the step
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
  const repoUrl = trimGitSuffix(trigger.repoUrl);
  const baseRef = trigger.baseRef ?? flowDefaults.baseRef;
  return `${repoUrl}/tree/${baseRef}/${dockerfilePath}`;
}

function trimGitSuffix(s: string) {
  if (s.endsWith(".git")) {
    return s.slice(0, -4);
  }
  return s;
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
