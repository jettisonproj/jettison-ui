import { useContext } from "react";

import { ApplicationsContext } from "src/providers/provider.tsx";
import { getRepoTreeLink, getRepoCommitLink } from "src/utils/gitUtil.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";

const ARGOCD_UI_URL = "https://argocd.osoriano.com";

interface ArgoCDStepLinksProps {
  step: ArgoCDStep;
}
function ArgoCDStepLinks({ step }: ArgoCDStepLinksProps) {
  const { repoUrl, baseRef, repoPath } = step;

  const repoTreeLink = getRepoTreeLink(repoUrl, baseRef);
  const repoLink = `${repoTreeLink}/${step.repoPath}`;

  const applications = useContext(ApplicationsContext);
  const application = applications?.get(repoUrl)?.get(repoPath);
  const applicationLink = getApplicationLink(application);
  const commitLink = getCommitLink(repoUrl, application);

  return (
    <ul>
      {applicationLink && (
        <li>
          <a href={applicationLink} target="_blank" rel="noreferrer">
            Argo CD Application UI
          </a>
        </li>
      )}
      <li>
        <a href={repoLink} target="_blank" rel="noreferrer">
          Argo CD Resource Definitions
        </a>
      </li>
      {commitLink && (
        <li>
          <a href={commitLink} target="_blank" rel="noreferrer">
            Argo CD Resources Commit
          </a>
        </li>
      )}
    </ul>
  );
}

function getApplicationLink(application?: Application) {
  if (application == null) {
    return null;
  }
  const { namespace, name } = application.metadata;
  return `${ARGOCD_UI_URL}/applications/${namespace}/${name}`;
}

function getCommitLink(repoUrl: string, application?: Application) {
  if (application == null) {
    return null;
  }
  return getRepoCommitLink(repoUrl, application.status.sync.revision);
}

export { ArgoCDStepLinks };
