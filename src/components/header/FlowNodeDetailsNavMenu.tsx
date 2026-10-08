import type { JSX } from "react";

import type {
  Application,
  ApplicationStatusResource,
} from "src/data/types/applicationTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import { getRepoCommitLink, getRepoPathLink } from "src/utils/gitUtil.ts";

const ARGOCD_UI_URL = "https://argocd.osoriano.com";

import styles from "src/components/header/NavMenu.module.css";

const FLOW_NODE_DETAILS_NAV_HEADER_POPOVER_ID =
  "flowNodeDetailsNavHeaderPopoverId";

interface FlowNodeDetailsNavMenuProps {
  // repoOrg: string;
  // repoName: string;
  // flowName?: string;
  nodeName: string;
  step?: ArgoCDStep;
  application?: Application | undefined;
  rolloutResource?: ApplicationStatusResource | null;
}
function FlowNodeDetailsNavMenu({
  // repoOrg,
  // repoName,
  // flowName,
  nodeName,
  step,
  application,
  rolloutResource,
}: FlowNodeDetailsNavMenuProps): JSX.Element {
  if (step == null || rolloutResource === undefined) {
    return <strong>{nodeName}</strong>;
  }
  //         <a
  //           className={styles.navMenuItem}
  //           href={`/api/v1/namespaces/${repoOrg}/flows/${flowName}`}
  //           target="_blank"
  //           rel="noreferrer"
  //         >
  //           <i className={`nf nf-fa-file_text_o ${styles.navMenuItemIcon}`} />{" "}
  //           View Flow YAML
  //         </a>

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
        popoverTarget={FLOW_NODE_DETAILS_NAV_HEADER_POPOVER_ID}
        className={styles.navMenuTitle}
      >
        <strong>
          {nodeName} &nbsp;
          <i className={`nf nf-cod-chevron_down ${styles.navMenuIcon}`} />
        </strong>
      </button>
      <div
        id={FLOW_NODE_DETAILS_NAV_HEADER_POPOVER_ID}
        className={styles.navMenu}
        popover="auto"
      >
        <div className={styles.navMenuItems}>
          <a
            className={styles.navMenuItem}
            href={repoLink}
            target="_blank"
            rel="noreferrer"
          >
            <i className={`nf nf-fa-layer_group ${styles.navMenuItemIcon}`} />{" "}
            Resource Definitions
          </a>
          {commitLink && (
            <a
              className={styles.navMenuItem}
              href={commitLink}
              target="_blank"
              rel="noreferrer"
            >
              <i className={`nf nf-fa-code_commit ${styles.navMenuItemIcon}`} />{" "}
              Resources Commit
            </a>
          )}
          {applicationLink && (
            <a
              className={styles.navMenuItem}
              href={applicationLink}
              target="_blank"
              rel="noreferrer"
            >
              <i className={`nf nf-md-kubernetes ${styles.navMenuItemIcon}`} />{" "}
              Argo CD UI
            </a>
          )}
          {rolloutLink && (
            <a
              className={styles.navMenuItem}
              href={rolloutLink}
              target="_blank"
              rel="noreferrer"
            >
              <i className={`nf nf-md-kubernetes ${styles.navMenuItemIcon}`} />{" "}
              Argo Rollouts UI
            </a>
          )}
          {kubernetesApplicationLink && (
            <a
              className={styles.navMenuItem}
              href={kubernetesApplicationLink}
              target="_blank"
              rel="noreferrer"
            >
              <i className={`nf nf-fa-file_text_o ${styles.navMenuItemIcon}`} />{" "}
              Application YAML
            </a>
          )}
          {kubernetesRolloutLink && (
            <a
              className={styles.navMenuItem}
              href={kubernetesRolloutLink}
              target="_blank"
              rel="noreferrer"
            >
              <i className={`nf nf-fa-file_text_o ${styles.navMenuItemIcon}`} />{" "}
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

export { FlowNodeDetailsNavMenu };
