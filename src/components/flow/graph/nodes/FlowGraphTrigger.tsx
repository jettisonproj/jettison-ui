import type { Trigger } from "src/data/types/flowTypes.ts";
import { FlowGraphGitHubTrigger } from "src/components/flow/graph/nodes/triggers/FlowGraphGitHubTrigger.tsx";
import { TriggerSource } from "src/data/types/flowTypes.ts";

interface FlowGraphTriggerProps {
  trigger: Trigger;
}
function FlowGraphTrigger({ trigger }: FlowGraphTriggerProps) {
  switch (trigger.triggerSource) {
    case TriggerSource.GitHubPullRequest:
    case TriggerSource.GitHubPush:
      return <FlowGraphGitHubTrigger trigger={trigger} />;
    default:
      trigger satisfies never;
  }
}
export { FlowGraphTrigger };
