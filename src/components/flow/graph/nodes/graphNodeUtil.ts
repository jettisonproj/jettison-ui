import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import { routes } from "src/routes.ts";
import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import { getTriggerRoute } from "src/routes.ts";

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
  getTriggerDetailsLink,
  getStepDetailsLink,
};
