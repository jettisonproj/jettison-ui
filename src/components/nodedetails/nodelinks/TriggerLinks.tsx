import type { Trigger } from "src/data/types/flowTypes.ts";
import { TriggerSource } from "src/data/types/flowTypes.ts";
import { GitHubTriggerLinks } from "src/components/nodedetails/nodelinks/triggers/GitHubTriggerLinks.tsx";

interface TriggerLinksProps {
  trigger: Trigger;
}
function TriggerLinks({ trigger }: TriggerLinksProps) {
  switch (trigger.triggerSource) {
    case TriggerSource.GitHubPullRequest:
    case TriggerSource.GitHubPush:
      return <GitHubTriggerLinks trigger={trigger} />;
    default:
      trigger satisfies never;
      console.log("unknown trigger");
      console.log(trigger);
  }
}

export { TriggerLinks };
