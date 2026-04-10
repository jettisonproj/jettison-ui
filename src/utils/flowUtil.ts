import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import { routes } from "src/routes.ts";
import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import { getTriggerRoute } from "src/routes.ts";

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

export {
  getTriggerDisplayName,
  getTriggerDetailsLink,
  getStepDetailsLink,
  PR_DISPLAY_NAME,
  PUSH_DISPLAY_NAME,
  BUILD_DISPLAY_NAME,
  PUBLISH_DISPLAY_NAME,
};
