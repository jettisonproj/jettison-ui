import type { JSX } from "react";
import { useCallback, useContext } from "react";

import styles from "src/components/header/NavMenu.module.css";
import type {
  Application,
  ApplicationStatusResource,
} from "src/data/types/applicationTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import { FlowMessageTypes } from "src/providers/flowWebSocket.ts";
import { FlowWebSocketContext } from "src/providers/provider.tsx";
import { getRepoCommitLink, getRepoPathLink } from "src/utils/gitUtil.ts";

const ARGOCD_UI_URL = "https://argocd.osoriano.com";

const FLOW_NODE_DETAILS_NAV_HEADER_POPOVER_ID =
  "flowNodeDetailsNavHeaderPopoverId";

interface FlowNodeDetailsNavMenuProps {
  nodeName: string;
  argoCdStep?: ArgoCDStep;
  application?: Application | undefined;
  rolloutResource?: ApplicationStatusResource | null;
}
function FlowNodeDetailsNavMenu({
  nodeName,
  argoCdStep,
  application,
  rolloutResource,
}: FlowNodeDetailsNavMenuProps): JSX.Element {
  const flowWebSocket = useContext(FlowWebSocketContext);

  const onApplicationSyncClick = useCallback(() => {
    if (application == null) {
      console.log("error: cannot sync null application");
      return;
    }
    flowWebSocket.send({
      messageType: FlowMessageTypes.syncApplication,
      messageData: {
        namespace: application.metadata.namespace,
        name: application.metadata.name,
      },
    });
  }, [flowWebSocket, application]);

  const onRetryRolloutClick = useCallback(() => {
    if (rolloutResource == null) {
      console.log("error: cannot retry null rollout");
      return;
    }
    flowWebSocket.send({
      messageType: FlowMessageTypes.retryRollout,
      messageData: {
        namespace: rolloutResource.namespace,
        name: rolloutResource.name,
      },
    });
  }, [flowWebSocket, rolloutResource]);

  if (argoCdStep == null) {
    return <strong>{nodeName}</strong>;
  }

  const { repoUrl, baseRef, repoPath } = argoCdStep;

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
          {application != null && (
            <div
              className={styles.navMenuItem}
              onClick={onApplicationSyncClick}
            >
              <i
                className={`nf nf-fa-arrow_right_arrow_left ${styles.navMenuItemIcon}`}
              />{" "}
              Sync Application
            </div>
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
          {rolloutResource != null && (
            <div className={styles.navMenuItem} onClick={onRetryRolloutClick}>
              <i className={`nf nf-fa-repeat ${styles.navMenuItemIcon}`} />{" "}
              Retry Resource
            </div>
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
  rolloutResource: ApplicationStatusResource | null | undefined,
): string | null {
  if (applicationLink == null || rolloutResource == null) {
    return null;
  }
  const { namespace, name } = rolloutResource;
  return `${applicationLink}?node=argoproj.io%2FRollout%2F${namespace}%2F${name}%2F0&resource=&tab=extension-0`;
}

function getKubernetesRolloutLink(
  rolloutResource: ApplicationStatusResource | null | undefined,
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
