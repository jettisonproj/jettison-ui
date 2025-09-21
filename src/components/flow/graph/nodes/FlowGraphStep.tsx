import type { Step } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { StepSource } from "src/data/types/flowTypes.ts";
import { FlowGraphArgoCDStep } from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDStep.tsx";
import { FlowGraphDockerStep } from "src/components/flow/graph/nodes/steps/FlowGraphDockerStep.tsx";

interface FlowGraphStepProps {
  repoOrg: string;
  repoName: string;
  flowName: string;
  step: Step;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphStep({
  repoOrg,
  repoName,
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
          repoOrg={repoOrg}
          repoName={repoName}
          flowName={flowName}
          step={step}
          isPrFlow={isPrFlow}
          workflows={workflows}
        />
      );
    case StepSource.ArgoCD:
      return (
        <FlowGraphArgoCDStep
          repoOrg={repoOrg}
          repoName={repoName}
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
