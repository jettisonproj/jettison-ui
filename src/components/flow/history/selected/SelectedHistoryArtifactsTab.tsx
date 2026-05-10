import { Fragment } from "react";

import styles from "src/components/flow/history/selected/SelectedHistoryArtifactsTab.module.css";
import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";
import {
  getArtifactDownloadUrl,
  getArtifactUiUrl,
  getNodeArtifactDisplayKeyName,
  getUserDefinedArtifacts,
} from "src/utils/workflowUtil.ts";

interface SelectedHistoryArtifactsTabProps {
  workflowNamespace: string;
  workflowUid: string;
  selectedNode: WorkflowStatusNode;
}
function SelectedHistoryArtifactsTab({
  workflowNamespace,
  workflowUid,
  selectedNode,
}: SelectedHistoryArtifactsTabProps) {
  return getUserDefinedArtifacts(selectedNode).map(
    (nodeArtifact, nodeArtifactIndex) => (
      <Fragment key={nodeArtifact.s3.key}>
        <div className={styles.artifactItem}>
          Artifact {nodeArtifactIndex + 1}
        </div>
        <div className={styles.artifactsTab}>
          <span className={styles.artifactsTabKey}>Artifact Key</span>
          <span>{getNodeArtifactDisplayKeyName(nodeArtifact.s3.key)}</span>
          <span className={styles.artifactsTabKey}>File Path</span>
          <span>{nodeArtifact.path}</span>
          <a
            className={styles.downloadLinkLeft}
            href={getArtifactDownloadUrl(
              workflowNamespace,
              workflowUid,
              selectedNode.id,
              nodeArtifact.name,
            )}
            target="_blank"
            rel="noreferrer"
          >
            <i className={`nf nf-fa-download ${styles.downloadLinkIcon}`} />
            Download Artifact
          </a>
          <a
            className={styles.downloadLink}
            href={getArtifactUiUrl(nodeArtifact.s3.key)}
            target="_blank"
            rel="noreferrer"
          >
            <i
              className={`nf nf-fa-external_link ${styles.downloadLinkIcon}`}
            />
            View in Artifact UI
          </a>
        </div>
      </Fragment>
    ),
  );
}

export { SelectedHistoryArtifactsTab };
