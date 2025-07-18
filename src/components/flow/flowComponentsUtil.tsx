import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import { StepSource } from "src/data/types/flowTypes.ts";
import { FlowGraphStep } from "src/components/flow/graph/nodes/FlowGraphStep.tsx";
import { FlowGraphTrigger } from "src/components/flow/graph/nodes/FlowGraphTrigger.tsx";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";

function getFlowTriggerNode(
  namespace: string,
  flowName: string,
  trigger: Trigger,
  isPrFlow: boolean,
) {
  return {
    label: flowDefaultTriggerName(trigger),
    width: 144,
    height: 100,
    children: (
      <FlowGraphTrigger
        namespace={namespace}
        flowName={flowName}
        trigger={trigger}
        isPrFlow={isPrFlow}
      />
    ),
  };
}

function getFlowStepNode(
  namespace: string,
  flowName: string,
  step: Step,
  trigger: Trigger,
) {
  /* The default dimentions */
  const width = 168;
  let height = 100;

  /* Step-specific dimensions */
  switch (step.stepSource) {
    case StepSource.ArgoCD:
      height = 124;
      break;
  }

  return {
    label: flowDefaultStepName(step),
    width,
    height,
    children: (
      <FlowGraphStep
        namespace={namespace}
        flowName={flowName}
        step={step}
        trigger={trigger}
      />
    ),
  };
}

export { getFlowStepNode, getFlowTriggerNode };
