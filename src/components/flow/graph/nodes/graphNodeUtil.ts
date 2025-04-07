import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import { routes } from "src/routes.ts";
import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import { trimGitSuffix } from "src/utils/gitUtil.ts";

function getDisplayRepoName(repoUrl: string) {
  const { pathname } = new URL(repoUrl);
  return getDisplayRepoPath(pathname, repoUrl);
}

/**
 * Return the last path component as a shorthand for
 * displaying the repo name
 */
function getDisplayRepoPath(pathname: string, defaultValue: string) {
  const pathnameParts = pathname.split("/");

  let lastPathnamePart = pathnameParts.pop();

  // Handle potential trailing or duplicate slashes
  while (!lastPathnamePart && pathnameParts.length > 0) {
    lastPathnamePart = pathnameParts.pop();
  }

  if (!lastPathnamePart) {
    // If unable to find last path component, return the full url
    return defaultValue;
  }

  // Remove the .git suffix for readability
  return trimGitSuffix(lastPathnamePart);
}

function getTriggerDetailsLink(
  namespace: string,
  flowName: string,
  trigger: Trigger,
) {
  const triggerName = flowDefaultTriggerName(trigger);
  return getNodeDetailsLink(namespace, flowName, triggerName);
}

function getStepDetailsLink(namespace: string, flowName: string, step: Step) {
  const stepName = flowDefaultStepName(step);
  return getNodeDetailsLink(namespace, flowName, stepName);
}

function getNodeDetailsLink(
  namespace: string,
  flowName: string,
  nodeName: string,
) {
  return `${routes.flows}/${namespace}/${flowName}/${nodeName}`;
}

export {
  getDisplayRepoName,
  getDisplayRepoPath,
  getTriggerDetailsLink,
  getStepDetailsLink,
};
