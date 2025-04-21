import type { Step, Trigger } from "src/data/types/flowTypes.ts";

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

export { flowDefaults, flowDefaultStepName, flowDefaultTriggerName };
