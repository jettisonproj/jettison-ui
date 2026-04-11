import { GitHubTriggerLinks } from "src/components/nodedetails/nodelinks/triggers/GitHubTriggerLinks.tsx";
import type { Trigger } from "src/data/types/flowTypes.ts";
import { TriggerSources } from "src/data/types/flowTypes.ts";

interface TriggerLinksProps {
  trigger: Trigger;
}
function TriggerLinks({ trigger }: TriggerLinksProps) {
  switch (trigger.triggerSource) {
    case TriggerSources.GitHubPullRequest:
    case TriggerSources.GitHubPush:
      return <GitHubTriggerLinks trigger={trigger} />;
    default:
      trigger satisfies never;
      console.log("unknown trigger");
      console.log(trigger);
  }
}

export { TriggerLinks };
