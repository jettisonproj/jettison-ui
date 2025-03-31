import type { Trigger } from "src/data/types/flowTypes.ts";
import { getRepoTreeLink } from "src/components/nodedetails/nodelinks/nodeLinksUtil.ts";
import { flowDefaults } from "src/data/data.ts";
import type {
  DockerBuildTestStep,
  DockerBuildTestPublishStep,
} from "src/data/types/flowTypes.ts";

interface DockerStepLinksProps {
  step: DockerBuildTestStep | DockerBuildTestPublishStep;
  trigger: Trigger;
}
function DockerStepLinks({ step, trigger }: DockerStepLinksProps) {
  const dockerfilePath = step.dockerfilePath ?? flowDefaults.dockerfilePath;
  const repoLink = getRepoLink(dockerfilePath, trigger);
  return (
    <ul>
      <li>
        <a href={repoLink} target="_blank" rel="noreferrer">
          Repo URL
        </a>
      </li>
    </ul>
  );
}

function getRepoLink(dockerfilePath: string, trigger: Trigger) {
  const repoTreeLink = getRepoTreeLink(trigger.repoUrl, trigger.baseRef);
  return `${repoTreeLink}/${dockerfilePath}`;
}

export { DockerStepLinks };
