import { Link } from "react-router";

import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import { getRepoTreeLink } from "src/utils/gitUtil.ts";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  getDisplayRepoName,
  getTriggerDetailsLink,
} from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import type {
  GitHubPullRequestTrigger,
  GitHubPushTrigger,
} from "src/data/types/flowTypes.ts";
import { TriggerSource } from "src/data/types/flowTypes.ts";

interface FlowGraphGitHubTriggerProps {
  namespace: string;
  flowName: string;
  trigger: GitHubPullRequestTrigger | GitHubPushTrigger;
}
function FlowGraphGitHubTrigger({
  namespace,
  flowName,
  trigger,
}: FlowGraphGitHubTriggerProps) {
  const displayEvent = getDisplayEvent(trigger);
  const displayRepoName = getDisplayRepoName(trigger.repoUrl);
  const triggerDetailsLink = getTriggerDetailsLink(
    namespace,
    flowName,
    trigger,
  );
  const repoLink = getRepoTreeLink(trigger.repoUrl, trigger.baseRef);
  return (
    <FlowGraphNode>
      <Link to={triggerDetailsLink} className={styles.nodeLink} />
      <div className={styles.nodeContent}>
        <i className={`nf nf-fa-github ${styles.nodeIcon}`}></i>
        <a
          className={styles.nodeTextLink}
          href={repoLink}
          target="_blank"
          rel="noreferrer"
        >
          {displayRepoName}
        </a>
        <div className={styles.nodeTextLineBolder}>{displayEvent}</div>
      </div>
    </FlowGraphNode>
  );
}

function getDisplayEvent(
  trigger: GitHubPullRequestTrigger | GitHubPushTrigger,
) {
  switch (trigger.triggerSource) {
    case TriggerSource.GitHubPush:
      return "push";
    case TriggerSource.GitHubPullRequest:
      return "PR";
    default:
      trigger satisfies never;
      console.log("unknown trigger");
      console.log(trigger);
  }
}

export { FlowGraphGitHubTrigger };
