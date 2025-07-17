import type { Trigger } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { FlowGraphGitHubTrigger } from "src/components/flow/graph/nodes/triggers/FlowGraphGitHubTrigger.tsx";
import { TriggerSource } from "src/data/types/flowTypes.ts";

interface FlowGraphTriggerProps {
  namespace: string;
  flowName: string;
  trigger: Trigger;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphTrigger({
  namespace,
  flowName,
  trigger,
  isPrFlow,
  workflows,
}: FlowGraphTriggerProps) {
  switch (trigger.triggerSource) {
    case TriggerSource.GitHubPullRequest:
    case TriggerSource.GitHubPush:
      return (
        <FlowGraphGitHubTrigger
          namespace={namespace}
          flowName={flowName}
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
