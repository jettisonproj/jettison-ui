import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  getRepoTreeLink,
  getDisplayRepoName,
  getDisplayRepoPath,
} from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import type { ArgoCDStep } from "src/data/types.ts";

interface FlowGraphArgoCDStepProps {
  step: ArgoCDStep;
}
function FlowGraphArgoCDStep({ step }: FlowGraphArgoCDStepProps) {
  const displayRepoName = getDisplayRepoName(step.repoUrl);
  const displayRepoPath = getDisplayRepoPath(step.repoPath, step.repoPath);
  const repoLink = getRepoLink(step);
  return (
    <FlowGraphNode>
      <a
        href={repoLink}
        target="_blank"
        rel="noreferrer"
        className={styles.nodeLink}
      >
        <i
          className={`nf nf-dev-argocd ${styles.nodeIcon} ${styles.argoIcon}`}
        ></i>
        <div className={styles.nodeTextLine}>{displayRepoName}</div>
        <div className={styles.nodeTextLineBolder}>{displayRepoPath}</div>
      </a>
    </FlowGraphNode>
  );
}

function getRepoLink(step: ArgoCDStep) {
  const repoTreeLink = getRepoTreeLink(step.repoUrl, step.baseRef);
  return `${repoTreeLink}/${step.repoPath}`;
}

export { FlowGraphArgoCDStep };
