import type { JSX } from "react";

import type {
  Application,
  ApplicationStatusResource,
} from "src/data/types/applicationTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import { getRepoCommitLink, getRepoPathLink } from "src/utils/gitUtil.ts";

const ARGOCD_UI_URL = "https://argocd.osoriano.com";

interface ArgoCDStepLinksProps {
  step: ArgoCDStep;
  application: Application | undefined;
  rolloutResource: ApplicationStatusResource | null;
}
function ArgoCDStepLinks({
  step,
  application,
  rolloutResource,
}: ArgoCDStepLinksProps): JSX.Element {
  const { repoUrl, baseRef, repoPath } = step;

  const repoLink = getRepoPathLink(repoUrl, baseRef, repoPath);
  const applicationLink = getApplicationLink(application);
  const commitLink = getCommitLink(repoUrl, application);
  const rolloutLink = getRolloutLink(applicationLink, rolloutResource);
  const kubernetesApplicationLink = getKubernetesApplicationLink(application);
  const kubernetesRolloutLink = getKubernetesRolloutLink(rolloutResource);

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
      {rolloutLink && (
        <li>
          <a href={rolloutLink} target="_blank" rel="noreferrer">
            Argo Rollouts UI
          </a>
        </li>
      )}
      {kubernetesApplicationLink && (
        <li>
          <a href={kubernetesApplicationLink} target="_blank" rel="noreferrer">
            Kubernetes Application Definition{" "}
            <i className="nf nf-fa-file_text_o" />
          </a>
        </li>
      )}
      {kubernetesRolloutLink && (
        <li>
          <a href={kubernetesRolloutLink} target="_blank" rel="noreferrer">
            Kubernetes Rollout Definition <i className="nf nf-fa-file_text_o" />
          </a>
        </li>
      )}
    </ul>
  );
}

function getApplicationLink(application?: Application): string | null {
  if (application == null) {
    return null;
  }
  const { namespace, name } = application.metadata;
  return `${ARGOCD_UI_URL}/applications/${namespace}/${name}`;
}

function getCommitLink(
  repoUrl: string,
  application?: Application,
): string | null {
  if (application == null) {
    return null;
  }
  return getRepoCommitLink(repoUrl, application.status.sync.revision);
}

function getRolloutLink(
  applicationLink: string | null,
  rolloutResource: ApplicationStatusResource | null,
): string | null {
  if (applicationLink == null || rolloutResource == null) {
    return null;
  }
  const { namespace, name } = rolloutResource;
  return `${applicationLink}?node=argoproj.io%2FRollout%2F${namespace}%2F${name}%2F0&resource=&tab=extension-0`;
}

function getKubernetesRolloutLink(
  rolloutResource: ApplicationStatusResource | null,
): string | null {
  if (rolloutResource == null) {
    return null;
  }
  const { namespace, name } = rolloutResource;
  return `/api/v1/namespaces/${namespace}/rollouts/${name}`;
}

function getKubernetesApplicationLink(
  application?: Application,
): string | null {
  if (application == null) {
    return null;
  }
  const { namespace, name } = application.metadata;
  return `/api/v1/namespaces/${namespace}/applications/${name}`;
}

export { ArgoCDStepLinks };
