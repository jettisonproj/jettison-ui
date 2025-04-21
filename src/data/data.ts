import type { Step, Trigger } from "src/data/types/flowTypes.ts";

const stats = {
  namespaces: 5,
  flows: 5,
  triggers: 5,
  steps: 5,
};

const recentFlows = ["rollouts-demo/github-push", "rollouts-demo/github-pr"];

// todo need to get defaults from backend, or bake default into types
const flowDefaults = {
  baseRef: "main",
  dockerfilePath: "Dockerfile",
};

// todo need to get defaults from backend, or bake default into types
function flowDefaultStepName(step: Step) {
  return step.stepName ?? step.stepSource;
}

// todo need to get defaults from backend, or bake default into types
function flowDefaultTriggerName(trigger: Trigger) {
  return trigger.triggerName ?? trigger.triggerSource;
}

export {
  recentFlows,
  stats,
  flowDefaults,
  flowDefaultStepName,
  flowDefaultTriggerName,
};
