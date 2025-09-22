import type { Trigger } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { FlowGraphGitHubTrigger } from "src/components/flow/graph/nodes/triggers/FlowGraphGitHubTrigger.tsx";
import { TriggerSource } from "src/data/types/flowTypes.ts";

interface FlowGraphTriggerProps {
  repoOrg: string;
  repoName: string;
  trigger: Trigger;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphTrigger({
  repoOrg,
  repoName,
  trigger,
  isPrFlow,
  workflows,
}: FlowGraphTriggerProps) {
  switch (trigger.triggerSource) {
    case TriggerSource.GitHubPullRequest:
    case TriggerSource.GitHubPush:
      return (
        <FlowGraphGitHubTrigger
          repoOrg={repoOrg}
          repoName={repoName}
          trigger={trigger}
          isPrFlow={isPrFlow}
          workflows={workflows}
        />
      );
    default:
      trigger satisfies never;
      console.log("unknown trigger");
      console.log(trigger);
  }
}
export { FlowGraphTrigger };
