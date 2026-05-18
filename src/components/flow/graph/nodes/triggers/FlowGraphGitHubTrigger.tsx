import type { JSX } from "react";

import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  FlowGraphLoading,
  FlowGraphNode,
  FlowGraphNodeInfo,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import type {
  GitHubPullRequestTrigger,
  GitHubPushTrigger,
} from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  getTriggerDetailsLink,
  getTriggerDisplayName,
} from "src/utils/flowUtil.ts";
import { getLastWorkflowNodeForTrigger } from "src/utils/workflowUtil.ts";

interface FlowGraphGitHubTriggerProps {
  repoOrg: string;
  repoName: string;
  trigger: GitHubPullRequestTrigger | GitHubPushTrigger;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphGitHubTrigger({
  repoOrg,
  repoName,
  trigger,
  isPrFlow,
  workflows,
}: FlowGraphGitHubTriggerProps): JSX.Element {
  const displayEvent = getTriggerDisplayName(isPrFlow);
  const triggerDetailsLink = getTriggerDetailsLink(
    repoOrg,
    repoName,
    isPrFlow,
    trigger,
  );
  return (
    <FlowGraphNode
      headerClass={styles.nodeRowHeader}
      headerLink={triggerDetailsLink}
      titleIcon={`nf nf-fa-github ${styles.githubIcon}`}
      titleText={displayEvent}
    >
      <FlowGraphGitHubNode isPrFlow={isPrFlow} workflows={workflows} />
    </FlowGraphNode>
  );
}

interface FlowGraphGitHubNodeProps {
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphGitHubNode({
  isPrFlow,
  workflows,
}: FlowGraphGitHubNodeProps): JSX.Element {
  const workflowNode = getLastWorkflowNodeForTrigger(workflows);
  if (workflowNode == null) {
    return <FlowGraphLoading />;
  }
  return <FlowGraphNodeInfo isPrFlow={isPrFlow} workflowNode={workflowNode} />;
}

export { FlowGraphGitHubTrigger };
