import type { Step, Trigger } from "src/data/types/flowTypes.ts";
import { FlowGraphStep } from "src/components/flow/graph/nodes/FlowGraphStep.tsx";
import { FlowGraphTrigger } from "src/components/flow/graph/nodes/FlowGraphTrigger.tsx";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";

function getFlowTriggerNode(
  namespace: string,
  flowName: string,
  trigger: Trigger,
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
      />
    ),
  };
}

function getFlowStepNode(namespace: string, flowName: string, step: Step) {
  return {
    label: flowDefaultStepName(step),
    width: 168,
    height: 100,
    children: (
      <FlowGraphStep namespace={namespace} flowName={flowName} step={step} />
    ),
  };
}

export { getFlowStepNode, getFlowTriggerNode };
