import { getRepoTreeLink } from "src/components/nodedetails/nodelinks/nodeLinksUtil.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";

interface ArgoCDStepLinksProps {
  step: ArgoCDStep;
}
function ArgoCDStepLinks({ step }: ArgoCDStepLinksProps) {
  const repoLink = getRepoLink(step);
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

function getRepoLink(step: ArgoCDStep) {
  const repoTreeLink = getRepoTreeLink(step.repoUrl, step.baseRef);
  return `${repoTreeLink}/${step.repoPath}`;
}

export { ArgoCDStepLinks };
