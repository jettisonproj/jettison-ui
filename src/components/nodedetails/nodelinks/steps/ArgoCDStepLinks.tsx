import { useContext } from "react";

import { ApplicationsContext } from "src/providers/provider.tsx";
import { getRepoPathLink, getRepoCommitLink } from "src/utils/gitUtil.ts";
import { ResourceKind } from "src/data/types/baseResourceTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";

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
  const rolloutLink = getRolloutLink(applicationLink, application);
  const kubernetesResourceLink = getKubernetesResourceLink(application);

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
      {kubernetesResourceLink && (
        <li>
          <a href={kubernetesResourceLink} target="_blank" rel="noreferrer">
            Kubernetes Resource Definition{" "}
            <i className="nf nf-fa-file_text_o" />
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

function getRolloutLink(
  applicationLink: string | null,
  application?: Application,
) {
  if (applicationLink == null || application == null) {
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
  const { namespace, name } = rolloutResource;
  return `${applicationLink}?node=argoproj.io%2FRollout%2F${namespace}%2F${name}%2F0&resource=&tab=extension-0`;
}

function getKubernetesResourceLink(application?: Application) {
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
