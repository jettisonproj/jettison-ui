import type { JSX } from "react";

import { FlowGraphGitHubTrigger } from "src/components/flow/graph/nodes/triggers/FlowGraphGitHubTrigger.tsx";
import type { Trigger } from "src/data/types/flowTypes.ts";
import { TriggerSources } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";

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
}: FlowGraphTriggerProps): JSX.Element {
  switch (trigger.triggerSource) {
    case TriggerSources.GitHubPullRequest:
    case TriggerSources.GitHubPush:
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
      throw new FlowGraphTriggerError("invalid trigger source");
  }
}

class FlowGraphTriggerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowGraphTrigger };
