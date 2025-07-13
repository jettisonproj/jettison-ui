import { useContext } from "react";
import { useParams } from "react-router";

import { localState } from "src/localState.ts";
import {
  FlowError,
  getFlowTrigger,
  isPullRequestTrigger,
} from "src/components/flow/flowUtil.ts";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import { FlowsContext } from "src/providers/provider.tsx";
import type { Flow, Trigger } from "src/data/types/flowTypes.ts";
import {
  getFlowStepNode,
  getFlowTriggerNode,
} from "src/components/flow/flowComponentsUtil.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowNavHeader } from "src/components/header/NavHeader.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import { FlowHistory } from "src/components/flow/history/FlowHistory.tsx";
import type {
  FlowNode,
  FlowEdge,
} from "src/components/flow/graph/FlowGraph.tsx";

function Flow() {
  const { namespace, name } = useParams();
  if (!namespace || !name) {
    throw new FlowError(
      `path parameters cannot be empty: namespace=${namespace} name=${name}`,
    );
  }

  localState.addRecentFlow(namespace, name);

  return (
    <>
      <Header />
      <FlowNavHeader namespace={namespace} name={name} />
      <FlowItem namespace={namespace} name={name} />
    </>
  );
}

interface FlowItemProps {
  namespace: string;
  name: string;
}

function FlowItem({ namespace, name }: FlowItemProps) {
  const flows = useContext(FlowsContext);
  if (flows == null) {
    return <i className="nf nf-fa-spinner" />;
  }
  const flow = flows.get(namespace)?.get(name);
  if (flow == null) {
    return (
      <p>
        There is no flow{" "}
        <strong>
          {namespace}/{name}
        </strong>
        . Would you like to create one?
      </p>
    );
  }
  const trigger = getFlowTrigger(flow);
  const isPrFlow = isPullRequestTrigger(trigger);
  const flowNodes = getFlowNodes(flow, trigger, isPrFlow);
  const flowEdges = getFlowEdges(flow, trigger);

  return (
    <>
      <FlowGraph flowNodes={flowNodes} flowEdges={flowEdges} />
      <FlowHistory isPrFlow={isPrFlow} namespace={namespace} flowName={name} />
    </>
  );
}

function getFlowNodes(
  flow: Flow,
  trigger: Trigger,
  isPrFlow: boolean,
): FlowNode[] {
  const { namespace, name: flowName } = flow.metadata;
  const triggerNode = getFlowTriggerNode(
    namespace,
    flowName,
    trigger,
    isPrFlow,
  );

  const { steps } = flow.spec;
  const stepNodes = steps.map((step) =>
    getFlowStepNode(namespace, flowName, step, trigger),
  );

  return [triggerNode].concat(stepNodes);
}

function getFlowEdges(flow: Flow, trigger: Trigger): FlowEdge[] {
  const { steps } = flow.spec;
  let edgeIndex = 0;
  const triggerEdges = steps
    .filter((step) => !step.dependsOn || step.dependsOn.length === 0)
    .map((step) => ({
      label: `e${++edgeIndex}`,
      v: flowDefaultTriggerName(trigger),
      w: flowDefaultStepName(step),
    }));

  const nodeEdges = steps.flatMap((step) =>
    (step.dependsOn ?? []).map((dep) => ({
      label: `e${++edgeIndex}`,
      v: dep,
      w: flowDefaultStepName(step),
    })),
  );

  return triggerEdges.concat(nodeEdges);
}

export { Flow };
