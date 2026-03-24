import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import { StepSources } from "src/data/types/flowTypes.ts";
import { DockerStepLinks } from "src/components/nodedetails/nodelinks/steps/DockerStepLinks.tsx";
import { ArgoCDStepLinks } from "src/components/nodedetails/nodelinks/steps/ArgoCDStepLinks.tsx";

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
