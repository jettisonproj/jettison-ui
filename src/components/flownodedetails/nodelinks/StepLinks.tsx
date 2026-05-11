import { ArgoCDStepLinks } from "src/components/flownodedetails/nodelinks/steps/ArgoCDStepLinks.tsx";
import { DockerStepLinks } from "src/components/flownodedetails/nodelinks/steps/DockerStepLinks.tsx";
import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import { StepSources } from "src/data/types/flowTypes.ts";

interface StepLinksProps {
  step: Step;
  trigger: Trigger;
}
function StepLinks({ step, trigger }: StepLinksProps) {
  switch (step.stepSource) {
    case StepSources.DockerBuildTest:
    case StepSources.DockerBuildTestPublish:
      return <DockerStepLinks step={step} trigger={trigger} />;
    case StepSources.ArgoCD:
      return <ArgoCDStepLinks step={step} />;
    default:
      step satisfies never;
      console.log("unknown step");
      console.log(step);
  }
}

export { StepLinks };
