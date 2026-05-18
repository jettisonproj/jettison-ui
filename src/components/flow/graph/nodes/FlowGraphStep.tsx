import type { JSX } from "react";

import { FlowGraphArgoCDStep } from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDStep.tsx";
import { FlowGraphDockerStep } from "src/components/flow/graph/nodes/steps/FlowGraphDockerStep.tsx";
import type { Step } from "src/data/types/flowTypes.ts";
import { StepSources } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";

interface FlowGraphStepProps {
  repoOrg: string;
  repoName: string;
  step: Step;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphStep({
  repoOrg,
  repoName,
  step,
  isPrFlow,
  workflows,
}: FlowGraphStepProps): JSX.Element {
  switch (step.stepSource) {
    case StepSources.DockerBuildTest:
    case StepSources.DockerBuildTestPublish:
      return (
        <FlowGraphDockerStep
          repoOrg={repoOrg}
          repoName={repoName}
          step={step}
          isPrFlow={isPrFlow}
          workflows={workflows}
        />
      );
    case StepSources.ArgoCD:
      return (
        <FlowGraphArgoCDStep
          repoOrg={repoOrg}
          repoName={repoName}
          step={step}
          isPrFlow={isPrFlow}
          workflows={workflows}
        />
      );
    default:
      step satisfies never;
      console.log("unknown step");
      console.log(step);
      throw new FlowGraphStepError("invalid step source");
  }
}

class FlowGraphStepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowGraphStep };
