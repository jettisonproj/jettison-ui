import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  getRepoTreeLink,
  getDisplayRepoName,
} from "src/components/flow/graph/nodes/graphnodeutil.ts";
import type {
  GitHubPullRequestTrigger,
  GitHubPushTrigger,
} from "src/data/types.ts";
import { TriggerType } from "src/data/types.ts";

interface FlowGraphGitHubTriggerProps {
  trigger: GitHubPullRequestTrigger | GitHubPushTrigger;
}
function FlowGraphGitHubTrigger({ trigger }: FlowGraphGitHubTriggerProps) {
  const displayEvent = getDisplayEvent(trigger);
  const displayRepoName = getDisplayRepoName(trigger.repoUrl);
  const repoLink = getRepoTreeLink(trigger.repoUrl, trigger.baseRef);
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

export { FlowGraphGitHubTrigger };
