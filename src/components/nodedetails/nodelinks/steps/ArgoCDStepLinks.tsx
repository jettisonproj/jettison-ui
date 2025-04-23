import { useContext } from "react";

import { ApplicationsContext } from "src/providers/provider.tsx";
import { getRepoPathLink, getRepoCommitLink } from "src/utils/gitUtil.ts";
import { ResourceKind } from "src/data/types/baseResourceTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import type {
  Application,
  ApplicationStatusResource,
} from "src/data/types/applicationTypes.ts";

const ARGOCD_UI_URL = "https://argocd.osoriano.com";

interface ArgoCDStepLinksProps {
  step: ArgoCDStep;
}
function ArgoCDStepLinks({ step }: ArgoCDStepLinksProps) {
  const { repoUrl, baseRef, repoPath } = step;

  const repoLink = getRepoPathLink(repoUrl, baseRef, repoPath);

  const applications = useContext(ApplicationsContext);
  const application = applications?.get(repoUrl)?.get(repoPath);
  const applicationLink = getApplicationLink(application);
  const commitLink = getCommitLink(repoUrl, application);
  const rolloutResource = getRolloutResource(application);
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

function getRolloutResource(application?: Application) {
  if (application == null) {
    return null;
  }
  const rolloutResources = [];
  for (const resource of application.status.resources) {
    if (resource.kind === ResourceKind.Rollout.valueOf()) {
      rolloutResources.push(resource);
    }
  }
  if (rolloutResources.length !== 1) {
    const { namespace, name } = application.metadata;
    throw new ArgoCDStepLinksError(
      "Expected a single rollout in application " +
        `namespace=${namespace} name=${name}`,
    );
  }
  const rolloutResource = rolloutResources[0];
  if (rolloutResource == null) {
    const { namespace, name } = application.metadata;
    throw new ArgoCDStepLinksError(
      "Expected a single rollout in application " +
        `namespace=${namespace} name=${name}`,
    );
  }
  return rolloutResource;
}

function getRolloutLink(
  applicationLink: string | null,
  rolloutResource: ApplicationStatusResource | null,
) {
  if (applicationLink == null || rolloutResource == null) {
    return null;
  }
  const { namespace, name } = rolloutResource;
  return `${applicationLink}?node=argoproj.io%2FRollout%2F${namespace}%2F${name}%2F0&resource=&tab=extension-0`;
}

function getKubernetesRolloutLink(
  rolloutResource: ApplicationStatusResource | null,
) {
  if (rolloutResource == null) {
    return null;
  }
  const { namespace, name } = rolloutResource;
  return `http://osoriano.com:2846/api/v1/namespaces/${namespace}/rollouts/${name}`;
}

function getKubernetesApplicationLink(application?: Application) {
  if (application == null) {
    return null;
  }
  const { namespace, name } = application.metadata;
  return `http://osoriano.com:2846/api/v1/namespaces/${namespace}/applications/${name}`;
}

class ArgoCDStepLinksError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { ArgoCDStepLinks };
