import type { Trigger } from "src/data/types/flowTypes.ts";
import { getRepoPathLink } from "src/utils/gitUtil.ts";
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
  const repoLink = getRepoPathLink(
    trigger.repoUrl,
    trigger.baseRef,
    dockerfilePath,
  );
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

export { DockerStepLinks };
