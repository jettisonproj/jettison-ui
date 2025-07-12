import type { Flow, Trigger } from "src/data/types/flowTypes.ts";
import { TriggerSource } from "src/data/types/flowTypes.ts";

/* Get the trigger of the flow. Currently, exactly 1 trigger is expected */
function getFlowTrigger(flow: Flow): Trigger {
  const { triggers } = flow.spec;
  if (triggers.length !== 1) {
    throw new FlowError(`expected 1 Flow trigger but got: ${triggers.length}`);
  }
  const trigger = triggers[0];
  if (!trigger) {
    throw new FlowError(`expected Flow trigger but got: ${trigger}`);
  }
  return trigger;
}

function getFlowTriggerDisplayEvent(
  trigger: Trigger,
) {
  switch (trigger.triggerSource) {
    case TriggerSource.GitHubPush:
      return "push";
    case TriggerSource.GitHubPullRequest:
      return "PR";
    default:
      trigger satisfies never;
      console.log("unknown trigger");
      console.log(trigger);
  }
}

class FlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowError, getFlowTrigger, getFlowTriggerDisplayEvent };
