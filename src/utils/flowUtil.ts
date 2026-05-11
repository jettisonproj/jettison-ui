import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import type {
  Flow,
  PushPrFlows,
  Step,
  Trigger,
} from "src/data/types/flowTypes.ts";
import { TriggerSources } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
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
  return getFlowNodeDetailsLink(repoOrg, repoName, isPrFlow, triggerName);
}

function getStepDetailsLink(
  repoOrg: string,
  repoName: string,
  isPrFlow: boolean,
  step: Step,
) {
  const stepName = flowDefaultStepName(step);
  return getFlowNodeDetailsLink(repoOrg, repoName, isPrFlow, stepName);
}

function getFlowNodeDetailsLink(
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

function getPushPrWorkflows(
  flows: Map<string, PushPrFlows> | null,
  workflows: Map<string, Map<string, Map<string, Workflow>>> | null,
  repoOrgName: string,
  repoOrg: string,
): [
  Map<string, Workflow> | null | undefined,
  Map<string, Workflow> | null | undefined,
] {
  if (flows == null || workflows == null) {
    // The flows or workflows have not yet loaded
    return [null, null];
  }

  const pushPrFlows = flows.get(repoOrgName);
  if (pushPrFlows == null) {
    throw new FlowUtilError(
      `Unexpected flow repo when looking up workflows: ${repoOrgName}`,
    );
  }

  const pushFlow = pushPrFlows.pushFlow;
  const prFlow = pushPrFlows.prFlow;

  if (pushFlow == null) {
    throw new FlowUtilError(
      `Empty push flow when looking up workflows: ${repoOrgName}`,
    );
  }

  if (prFlow == null) {
    throw new FlowUtilError(
      `Empty PR flow when looking up workflows: ${repoOrgName}`,
    );
  }

  // The repoOrg and namespace are expected to match
  const repoOrgWorkflows = workflows.get(repoOrg);
  if (repoOrgWorkflows == null) {
    // There are no workflows
    return [undefined, undefined];
  }

  const pushWorkflows = repoOrgWorkflows.get(pushFlow.metadata.name);
  const prWorkflows = repoOrgWorkflows.get(prFlow.metadata.name);

  return [pushWorkflows, prWorkflows];
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
  getPushPrWorkflows,
  getStepDetailsLink,
  getTriggerDetailsLink,
  getTriggerDisplayName,
  isPullRequestTrigger,
  PR_DISPLAY_NAME,
  PUBLISH_DISPLAY_NAME,
  PUSH_DISPLAY_NAME,
};
