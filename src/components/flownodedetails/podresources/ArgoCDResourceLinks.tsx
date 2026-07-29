import type { JSX } from "react";

import styles from "src/components/flownodedetails/podresources/ArgoCDResourceLinks.module.css";
import type {
  Application,
  ApplicationStatusResource,
} from "src/data/types/applicationTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import { getRepoCommitLink, getRepoPathLink } from "src/utils/gitUtil.ts";

const ARGOCD_UI_URL = "https://argocd.osoriano.com";
const RESOURCE_LINKS_POPOVER_ID = "resourceLinksPopoverId";

interface ArgoCDResourceLinksProps {
  step: ArgoCDStep;
  application: Application | undefined;
  rolloutResource: ApplicationStatusResource | null;
}
function ArgoCDResourceLinks({
  step,
  application,
  rolloutResource,
}: ArgoCDResourceLinksProps): JSX.Element | null {
  const { repoUrl, baseRef, repoPath } = step;

  const repoLink = getRepoPathLink(repoUrl, baseRef, repoPath);
  const applicationLink = getApplicationLink(application);
  const commitLink = getCommitLink(repoUrl, application);
  const rolloutLink = getRolloutLink(applicationLink, rolloutResource);
  const kubernetesApplicationLink = getKubernetesApplicationLink(application);
  const kubernetesRolloutLink = getKubernetesRolloutLink(rolloutResource);

  return (
    <>
      <button
        popoverTarget={RESOURCE_LINKS_POPOVER_ID}
        className={`nf nf-fa-ellipsis ${styles.linksMenuIcon}`}
      />
      <div
        id={RESOURCE_LINKS_POPOVER_ID}
        className={styles.linksMenu}
        popover="auto"
      >
        <div className={styles.linksMenuItems}>
          <a
            className={styles.linksMenuItem}
            href={repoLink}
            target="_blank"
            rel="noreferrer"
          >
            <i className={`nf nf-fa-layer_group ${styles.linksMenuItemIcon}`} />{" "}
            Resource Definitions
          </a>
          {commitLink && (
            <a
              className={styles.linksMenuItem}
              href={commitLink}
              target="_blank"
              rel="noreferrer"
            >
              <i
                className={`nf nf-fa-code_commit ${styles.linksMenuItemIcon}`}
              />{" "}
              Resources Commit
            </a>
          )}
          {applicationLink && (
            <a
              className={styles.linksMenuItem}
              href={applicationLink}
              target="_blank"
              rel="noreferrer"
            >
              <i
                className={`nf nf-md-kubernetes ${styles.linksMenuItemIcon}`}
              />{" "}
              Argo CD UI
            </a>
          )}
          {rolloutLink && (
            <a
              className={styles.linksMenuItem}
              href={rolloutLink}
              target="_blank"
              rel="noreferrer"
            >
              <i
                className={`nf nf-md-kubernetes ${styles.linksMenuItemIcon}`}
              />{" "}
              Argo Rollouts UI
            </a>
          )}
          {kubernetesApplicationLink && (
            <a
              className={styles.linksMenuItem}
              href={kubernetesApplicationLink}
              target="_blank"
              rel="noreferrer"
            >
              <i
                className={`nf nf-fa-file_text_o ${styles.linksMenuItemIcon}`}
              />{" "}
              Application YAML
            </a>
          )}
          {kubernetesRolloutLink && (
            <a
              className={styles.linksMenuItem}
              href={kubernetesRolloutLink}
              target="_blank"
              rel="noreferrer"
            >
              <i
                className={`nf nf-fa-file_text_o ${styles.linksMenuItemIcon}`}
              />{" "}
              Rollout YAML
            </a>
          )}
        </div>
      </div>
    </>
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

export { ArgoCDResourceLinks };
