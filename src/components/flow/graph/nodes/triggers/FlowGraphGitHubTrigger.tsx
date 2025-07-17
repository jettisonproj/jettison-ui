import {
  FlowGraphNode,
  FlowGraphCommit,
  FlowGraphTimestamp,
  FlowGraphLoading,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  getTriggerDetailsLink,
  getLastWorkflowNodeForTrigger,
} from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import type {
  GitHubPullRequestTrigger,
  GitHubPushTrigger,
} from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";

interface FlowGraphGitHubTriggerProps {
  namespace: string;
  flowName: string;
  trigger: GitHubPullRequestTrigger | GitHubPushTrigger;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphGitHubTrigger({
  namespace,
  flowName,
  trigger,
  isPrFlow,
  workflows,
}: FlowGraphGitHubTriggerProps) {
  const displayEvent = isPrFlow ? "PR" : "PUSH";
  const triggerDetailsLink = getTriggerDetailsLink(
    namespace,
    flowName,
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
