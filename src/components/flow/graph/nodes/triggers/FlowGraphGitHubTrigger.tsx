import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import { flowDefaults } from "src/data/data.ts";
import type {
  GitHubPullRequestTrigger,
  GitHubPushTrigger,
} from "src/data/types.ts";
import { TriggerType } from "src/data/types.ts"

interface FlowGraphGitHubTriggerProps {
  trigger: GitHubPullRequestTrigger | GitHubPushTrigger;
}
function FlowGraphGitHubTrigger({ trigger }: FlowGraphGitHubTriggerProps) {
  const displayEvent = getDisplayEvent(trigger);
  const displayRepoName = getDisplayRepoName(trigger);
  const repoLink = getRepoLink(trigger);
  return (
    <FlowGraphNode>
      <a
        href={repoLink}
        target="_blank"
        rel="noreferrer"
        className={styles.nodeLink}
      >
        <i className={`nf nf-fa-github ${styles.nodeIcon}`}></i>
        <div className={styles.nodeTextLine}>{displayRepoName}</div>
        <div className={styles.nodeTextLineBolder}>{displayEvent}</div>
      </a>
    </FlowGraphNode>
  );
}

function getDisplayEvent(
  trigger: GitHubPullRequestTrigger | GitHubPushTrigger,
) {
  switch (trigger.triggerSource) {
    case TriggerType.GitHubPush:
      return "push";
    case TriggerType.GitHubPullRequest:
      return "PR";
    default:
      trigger satisfies never;
  }
}

/**
 * Return the last path component as a shorthand for
 * displaying the repo name
 */
function getDisplayRepoName(
  trigger: GitHubPullRequestTrigger | GitHubPushTrigger,
) {
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

function getRepoLink(trigger: GitHubPullRequestTrigger | GitHubPushTrigger) {
  const repoUrl = trimGitSuffix(trigger.repoUrl);
  const baseRef = trigger.baseRef ?? flowDefaults.baseRef;
  return `${repoUrl}/tree/${baseRef}`;
}

function trimGitSuffix(s: string) {
  if (s.endsWith(".git")) {
    return s.slice(0, -4);
  }
  return s;
}

export { FlowGraphGitHubTrigger };
