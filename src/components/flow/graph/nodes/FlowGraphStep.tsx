import type { Step, Trigger } from "src/data/types.ts";
import { StepType } from "src/data/types.ts";
import { FlowGraphArgoCDStep } from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDStep.tsx";
import { FlowGraphDockerStep } from "src/components/flow/graph/nodes/steps/FlowGraphDockerStep.tsx";

interface FlowGraphStepProps {
  step: Step;
  trigger: Trigger;
}
function FlowGraphStep({ step, trigger }: FlowGraphStepProps) {
  switch (step.stepSource) {
    case StepType.DockerBuildTest:
    case StepType.DockerBuildTestPublish:
      return <FlowGraphDockerStep step={step} trigger={trigger} />;
    case StepType.ArgoCD:
      return <FlowGraphArgoCDStep step={step} />;
    default:
      step satisfies never;
  }
}

export { FlowGraphStep };
