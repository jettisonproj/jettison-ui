import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { StepSource } from "src/data/types/flowTypes.ts";
import { FlowGraphStep } from "src/components/flow/graph/nodes/FlowGraphStep.tsx";
import { FlowGraphTrigger } from "src/components/flow/graph/nodes/FlowGraphTrigger.tsx";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";

const NODE_WIDTH = 268;
const TRIGGER_NODE_HEIGHT = 115;
const DOCKER_NODE_HEIGHT = 134;
const ARGO_NODE_HEIGHT = 164;

function getFlowTriggerNode(
  namespace: string,
  flowName: string,
  trigger: Trigger,
  isPrFlow: boolean,
  workflows: Workflow[],
) {
  return {
    label: flowDefaultTriggerName(trigger),
    width: NODE_WIDTH,
    height: TRIGGER_NODE_HEIGHT,
    children: (
      <FlowGraphTrigger
        namespace={namespace}
        flowName={flowName}
        trigger={trigger}
        isPrFlow={isPrFlow}
        workflows={workflows}
      />
    ),
  };
}

function getStepHeight(stepSource: StepSource) {
  switch (stepSource) {
    case StepSource.DockerBuildTest:
    case StepSource.DockerBuildTestPublish:
      return DOCKER_NODE_HEIGHT;
    case StepSource.ArgoCD:
      return ARGO_NODE_HEIGHT;
    default:
      stepSource satisfies never;
      console.log("unknown stepSource");
      console.log(stepSource);
      return ARGO_NODE_HEIGHT;
  }
}

function getFlowStepNode(
  namespace: string,
  flowName: string,
  step: Step,
  isPrFlow: boolean,
  workflows: Workflow[],
) {
  /* The default dimentions */
  const width = NODE_WIDTH;
  const height = getStepHeight(step.stepSource);

  return {
    label: flowDefaultStepName(step),
    width,
    height,
    children: (
      <FlowGraphStep
        namespace={namespace}
        flowName={flowName}
        step={step}
        isPrFlow={isPrFlow}
        workflows={workflows}
      />
    ),
  };
}

export { getFlowStepNode, getFlowTriggerNode };
