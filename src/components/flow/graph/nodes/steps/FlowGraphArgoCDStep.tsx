import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import type { ArgoCDStep } from "src/data/types.ts";
import { flowDefaults } from "src/data/data.ts";

interface FlowGraphArgoCDStepProps {
  step: ArgoCDStep;
}
function FlowGraphArgoCDStep({ step }: FlowGraphArgoCDStepProps) {
  const displayRepoName = getDisplayRepoName(step);
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
        <i className={`nf nf-dev-argocd ${styles.nodeIcon}`}></i>
        <div className={styles.nodeTextLine}>{displayRepoName}</div>
        <div className={styles.nodeTextLineBolder}>{displayRepoPath}</div>
      </a>
    </FlowGraphNode>
  );
}

/**
 * Return the last path component as a shorthand for
 * displaying the repo name
 */
function getDisplayRepoName(step: ArgoCDStep) {
  const repoUrl = new URL(step.repoUrl);
  const { pathname } = repoUrl;
  return getDisplayRepoPath(pathname, step.repoUrl);
}

function getDisplayRepoPath(pathname: string, defaultValue: string) {
  const pathnameParts = pathname.split("/");

  let lastPathnamePart = pathnameParts.pop();

  // Handle potential trailing or duplicate slashes
  while (!lastPathnamePart && pathnameParts.length > 0) {
    lastPathnamePart = pathnameParts.pop();
  }

  if (!lastPathnamePart) {
    // If unable to find last path component, return the full url
    return defaultValue;
  }

  // Remove the .git suffix for readability
  return trimGitSuffix(lastPathnamePart);
}

function getRepoLink(step: ArgoCDStep) {
  const repoUrl = trimGitSuffix(step.repoUrl);
  const baseRef = step.baseRef ?? flowDefaults.baseRef;
  return `${repoUrl}/tree/${baseRef}/${step.repoPath}`;
}

function trimGitSuffix(s: string) {
  if (s.endsWith(".git")) {
    return s.slice(0, -4);
  }
  return s;
}

export { FlowGraphArgoCDStep };
