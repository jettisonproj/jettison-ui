import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import type { Flow, Step, Trigger } from "src/data/types/flowTypes.ts";
import { TriggerSources } from "src/data/types/flowTypes.ts";
import { getTriggerRoute, routes } from "src/routes.ts";

const BUILD_DISPLAY_NAME = "BUILD";
const PUBLISH_DISPLAY_NAME = "PUBLISH";
const PR_DISPLAY_NAME = "PR";
const PUSH_DISPLAY_NAME = "PUSH";

function getTriggerDisplayName(isPrFlow: boolean) {
  if (isPrFlow) {
    return PR_DISPLAY_NAME;
  }
  return PUSH_DISPLAY_NAME;
}

function getTriggerDetailsLink(
  repoOrg: string,
  repoName: string,
  isPrFlow: boolean,
  trigger: Trigger,
) {
  const triggerName = flowDefaultTriggerName(trigger);
  return getNodeDetailsLink(repoOrg, repoName, isPrFlow, triggerName);
}

function getStepDetailsLink(
  repoOrg: string,
  repoName: string,
  isPrFlow: boolean,
  step: Step,
) {
  const stepName = flowDefaultStepName(step);
  return getNodeDetailsLink(repoOrg, repoName, isPrFlow, stepName);
}

function getNodeDetailsLink(
  repoOrg: string,
  repoName: string,
  isPrFlow: boolean,
  nodeName: string,
) {
  const triggerRoute = getTriggerRoute(isPrFlow);
  return `${routes.flows}/${repoOrg}/${repoName}/${triggerRoute}/${nodeName}`;
}

/* Get the trigger of the flow. Currently, exactly 1 trigger is expected */
function getFlowTrigger(flow: Flow): Trigger {
  const { triggers } = flow.spec;
  if (triggers.length !== 1) {
    throw new FlowUtilError(
      `expected 1 Flow trigger but got: ${triggers.length}`,
    );
  }
  const trigger = triggers[0];
  if (!trigger) {
    throw new FlowUtilError(`expected Flow trigger but got: ${trigger}`);
  }
  return trigger;
}

/* Get whether the flow is a PR flow, based on the trigger type */
function isPullRequestTrigger(trigger: Trigger) {
  switch (trigger.triggerSource) {
    case TriggerSources.GitHubPush:
      return false;
    case TriggerSources.GitHubPullRequest:
      return true;
    default:
      trigger satisfies never;
      console.log("unknown trigger");
      console.log(trigger);
      return false;
  }
}

class FlowUtilError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export {
  BUILD_DISPLAY_NAME,
  FlowUtilError,
  getFlowTrigger,
  getStepDetailsLink,
  getTriggerDetailsLink,
  getTriggerDisplayName,
  isPullRequestTrigger,
  PR_DISPLAY_NAME,
  PUBLISH_DISPLAY_NAME,
  PUSH_DISPLAY_NAME,
};
