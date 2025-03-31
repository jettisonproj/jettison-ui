import type { Trigger } from "src/data/types/flowTypes.ts";
import { FlowGraphGitHubTrigger } from "src/components/flow/graph/nodes/triggers/FlowGraphGitHubTrigger.tsx";
import { TriggerSource } from "src/data/types/flowTypes.ts";

interface FlowGraphTriggerProps {
  namespace: string;
  flowName: string;
  trigger: Trigger;
}
function FlowGraphTrigger({
  namespace,
  flowName,
  trigger,
}: FlowGraphTriggerProps) {
  switch (trigger.triggerSource) {
    case TriggerSource.GitHubPullRequest:
    case TriggerSource.GitHubPush:
      return (
        <FlowGraphGitHubTrigger
          namespace={namespace}
          flowName={flowName}
          trigger={trigger}
        />
      );
    default:
      trigger satisfies never;
      console.log("unknown trigger");
      console.log(trigger);
  }
}
export { FlowGraphTrigger };
