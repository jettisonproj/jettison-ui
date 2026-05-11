import { FlowGraphStep } from "src/components/flow/graph/nodes/FlowGraphStep.tsx";
import { FlowGraphTrigger } from "src/components/flow/graph/nodes/FlowGraphTrigger.tsx";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import type { Step, StepSource, Trigger } from "src/data/types/flowTypes.ts";
import { StepSources } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";

const NODE_WIDTH = 318;
const TRIGGER_NODE_HEIGHT = 158;
const DOCKER_NODE_HEIGHT = 198;
const ARGO_NODE_HEIGHT = 242;

function getFlowTriggerNode(
  repoOrg: string,
  repoName: string,
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
        repoOrg={repoOrg}
        repoName={repoName}
        trigger={trigger}
        isPrFlow={isPrFlow}
        workflows={workflows}
      />
    ),
  };
}

function getStepHeight(stepSource: StepSource) {
  switch (stepSource) {
    case StepSources.DockerBuildTest:
    case StepSources.DockerBuildTestPublish:
      return DOCKER_NODE_HEIGHT;
    case StepSources.ArgoCD:
      return ARGO_NODE_HEIGHT;
    default:
      stepSource satisfies never;
      console.log("unknown stepSource");
      console.log(stepSource);
      return ARGO_NODE_HEIGHT;
  }
}

function getFlowStepNode(
  repoOrg: string,
  repoName: string,
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
        repoOrg={repoOrg}
        repoName={repoName}
        step={step}
        isPrFlow={isPrFlow}
        workflows={workflows}
      />
    ),
  };
}

// todo move out when removing FlowNodeDetails
// eslint-disable-next-line react-refresh/only-export-components
export { getFlowStepNode, getFlowTriggerNode, NODE_WIDTH };
