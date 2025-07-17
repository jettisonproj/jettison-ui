import type { Step } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { StepSource } from "src/data/types/flowTypes.ts";
import { FlowGraphArgoCDStep } from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDStep.tsx";
import { FlowGraphDockerStep } from "src/components/flow/graph/nodes/steps/FlowGraphDockerStep.tsx";

interface FlowGraphStepProps {
  namespace: string;
  flowName: string;
  step: Step;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphStep({
  namespace,
  flowName,
  step,
  isPrFlow,
  workflows,
}: FlowGraphStepProps) {
  switch (step.stepSource) {
    case StepSource.DockerBuildTest:
    case StepSource.DockerBuildTestPublish:
      return (
        <FlowGraphDockerStep
          namespace={namespace}
          flowName={flowName}
          step={step}
          isPrFlow={isPrFlow}
          workflows={workflows}
        />
      );
    case StepSource.ArgoCD:
      return (
        <FlowGraphArgoCDStep
          namespace={namespace}
          flowName={flowName}
          step={step}
          isPrFlow={isPrFlow}
          workflows={workflows}
        />
      );
    default:
      step satisfies never;
      console.log("unknown step");
      console.log(step);
  }
}

export { FlowGraphStep };
