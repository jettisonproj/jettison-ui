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

interface FlowGraphGitHubTriggerProps {
  namespace: string;
  flowName: string;
  trigger: GitHubPullRequestTrigger | GitHubPushTrigger;
  isPrFlow: boolean;
}
function FlowGraphGitHubTrigger({
  namespace,
  flowName,
  trigger,
  isPrFlow,
}: FlowGraphGitHubTriggerProps) {
  const displayEvent = isPrFlow ? "PR" : "push";
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

export { FlowGraphGitHubTrigger };
