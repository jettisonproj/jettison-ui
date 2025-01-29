import type { Trigger } from "src/data/types.ts";
import { FlowGraphGitHubTrigger } from "src/components/flow/graph/nodes/triggers/FlowGraphGitHubTrigger.tsx";
import { TriggerType } from "src/data/types.ts";

interface FlowGraphTriggerProps {
  trigger: Trigger;
}
function FlowGraphTrigger({ trigger }: FlowGraphTriggerProps) {
  switch (trigger.triggerSource) {
    case TriggerType.GitHubPullRequest:
    case TriggerType.GitHubPush:
      return <FlowGraphGitHubTrigger trigger={trigger} />;
    default:
      trigger satisfies never;
  }
}
export { FlowGraphTrigger };
