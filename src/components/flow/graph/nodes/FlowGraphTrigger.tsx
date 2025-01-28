import type { Trigger } from "src/data/types.ts";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";

// todo need to sync defaults
const defaultBaseRef = "main";

interface FlowGraphTriggerProps {
  trigger: Trigger;
}
function FlowGraphTrigger({ trigger }: FlowGraphTriggerProps) {
  // todo handle large base ref and repo names
  const displayBaseRef = getDisplayBaseRef(trigger);
  const displayRepoName = getDisplayRepoName(trigger);
  const repoLink = getRepoLink(trigger);
  return (
    <FlowGraphNode>
      <a
        href={repoLink}
        target="_blank"
        rel="noreferrer"
        className={styles.triggerLink}
      >
        <i className={`nf nf-fa-github ${styles.triggerIcon}`}></i>
        <div>{displayRepoName}</div>
        <div className={styles.triggerBaseRef}>{displayBaseRef}</div>
      </a>
    </FlowGraphNode>
  );
}

function getDisplayBaseRef(trigger: Trigger) {
  return trigger.baseRef ?? defaultBaseRef;
}

/**
 * Return the last path component as a shorthand for
 * displaying the repo name
 */
function getDisplayRepoName(trigger: Trigger) {
  const repoUrl = new URL(trigger.repoUrl);
  const { pathname } = repoUrl;
  const pathnameParts = pathname.split("/");

  let lastPathnamePart = pathnameParts.pop();

  // Handle potential trailing or duplicate slashes
  while (!lastPathnamePart && pathnameParts.length > 0) {
    lastPathnamePart = pathnameParts.pop();
  }

  if (!lastPathnamePart) {
    // If unable to find last path component, return the full url
    return trigger.repoUrl;
  }

  // Remove the .git suffix for readability
  return trimGitSuffix(lastPathnamePart);
}

function getRepoLink(trigger: Trigger) {
  const repoUrl = trimGitSuffix(trigger.repoUrl);
  const baseRef = trigger.baseRef ?? defaultBaseRef;
  return `${repoUrl}/tree/${baseRef}`;
}

function trimGitSuffix(s: string) {
  if (s.endsWith(".git")) {
    return s.slice(0, -4);
  }
  return s;
}

export { FlowGraphTrigger };
