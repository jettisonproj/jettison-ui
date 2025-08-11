import type {
  DockerBuildTestStep,
  DockerBuildTestPublishStep,
  Step,
  Trigger,
} from "src/data/types/flowTypes.ts";

// todo need to get defaults from backend, or bake default into types
const flowDefaults = {
  baseRef: "main",
};

// todo need to get defaults from backend, or bake default into types
function flowDefaultDockerfilePath(
  step: DockerBuildTestStep | DockerBuildTestPublishStep,
) {
  if (step.dockerfilePath) {
    return step.dockerfilePath;
  }
  if (step.dockerContextDir) {
    return `${step.dockerContextDir}/Dockerfile`;
  }
  return "Dockerfile";
}

// todo need to get defaults from backend, or bake default into types
function flowDefaultStepName(step: Step) {
  return step.stepName ?? step.stepSource;
}

// todo need to get defaults from backend, or bake default into types
function flowDefaultTriggerName(trigger: Trigger) {
  return trigger.triggerName ?? trigger.triggerSource;
}

export {
  flowDefaults,
  flowDefaultDockerfilePath,
  flowDefaultStepName,
  flowDefaultTriggerName,
};
