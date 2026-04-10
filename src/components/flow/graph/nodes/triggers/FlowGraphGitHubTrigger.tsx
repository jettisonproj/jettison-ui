import {
  FlowGraphNode,
  FlowGraphCommit,
  FlowGraphTimestamp,
  FlowGraphLoading,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import type {
  GitHubPullRequestTrigger,
  GitHubPushTrigger,
} from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  getTriggerDisplayName,
  getTriggerDetailsLink,
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
}: FlowGraphGitHubTriggerProps) {
  const displayEvent = getTriggerDisplayName(isPrFlow);
  const triggerDetailsLink = getTriggerDetailsLink(
    repoOrg,
    repoName,
    isPrFlow,
    trigger,
  );
  return (
    <FlowGraphNode
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
}: FlowGraphGitHubNodeProps) {
  const workflowNode = getLastWorkflowNodeForTrigger(workflows);
  if (workflowNode == null) {
    return <FlowGraphLoading />;
  }
  const { workflow, node } = workflowNode;
  return (
    <>
      <FlowGraphCommit isPrFlow={isPrFlow} workflow={workflow} />
      <FlowGraphTimestamp node={node} />
    </>
  );
}

export { FlowGraphGitHubTrigger };
