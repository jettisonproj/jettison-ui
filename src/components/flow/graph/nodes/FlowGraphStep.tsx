import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import { StepSource } from "src/data/types/flowTypes.ts";
import { FlowGraphArgoCDStep } from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDStep.tsx";
import { FlowGraphDockerStep } from "src/components/flow/graph/nodes/steps/FlowGraphDockerStep.tsx";

interface FlowGraphStepProps {
  step: Step;
  trigger: Trigger;
}
function FlowGraphStep({ step, trigger }: FlowGraphStepProps) {
  switch (step.stepSource) {
    case StepSource.DockerBuildTest:
    case StepSource.DockerBuildTestPublish:
      return <FlowGraphDockerStep step={step} trigger={trigger} />;
    case StepSource.ArgoCD:
      return <FlowGraphArgoCDStep step={step} />;
    default:
      step satisfies never;
  }
}

export { FlowGraphStep };
