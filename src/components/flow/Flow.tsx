import { useParams } from "react-router";

import {
  flowByNamespaceName,
  flowDefaultStepName,
  flowDefaultTriggerName,
  workflowsByNamespaceName,
} from "src/data/data.ts";
import type { Flow } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { Content } from "src/components/content/Content.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowNavHeader } from "src/components/header/NavHeader.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import { FlowHistory } from "src/components/flow/history/FlowHistory.tsx";
import { FlowGraphStep } from "src/components/flow/graph/nodes/FlowGraphStep.tsx";
import { FlowGraphTrigger } from "src/components/flow/graph/nodes/FlowGraphTrigger.tsx";
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

  const flowByName = flowByNamespaceName[namespace] ?? {};
  const flow = flowByName[name];
  const workflowsByName = workflowsByNamespaceName[namespace] ?? {};
  const workflows = workflowsByName[name] ?? [];

  return (
    <>
      <Header />
      <Content>
        <FlowNavHeader namespace={namespace} name={name} />
        <FlowItem
          namespace={namespace}
          name={name}
          flow={flow}
          workflows={workflows}
        />
      </Content>
    </>
  );
}

interface FlowItemProps {
  namespace: string;
  name: string;
  flow: Flow | undefined;
  workflows: Workflow[];
}

function FlowItem({ namespace, name, flow, workflows }: FlowItemProps) {
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
  const flowNodes = getFlowNodes(flow);
  const flowEdges = getFlowEdges(flow);
  return (
    <>
      <FlowGraph flowNodes={flowNodes} flowEdges={flowEdges} />
      <FlowHistory workflows={workflows} namespace={namespace} />
      <pre>{JSON.stringify(flow, null, 2)}</pre>
    </>
  );
}

function getFlowNodes(flow: Flow): FlowNode[] {
  const { triggers } = flow.spec;
  if (triggers.length !== 1) {
    throw new FlowError(`expected 1 Flow trigger but got: ${triggers.length}`);
  }
  const trigger = triggers[0];
  const triggerNode = {
    label: flowDefaultTriggerName(trigger),
    width: 144,
    height: 100,
    children: <FlowGraphTrigger trigger={trigger} />,
  };

  const { steps } = flow.spec;
  const stepNodes = steps.map((step) => ({
    label: flowDefaultStepName(step),
    width: 168,
    height: 100,
    children: <FlowGraphStep step={step} trigger={trigger} />,
  }));

  return [triggerNode].concat(stepNodes);
}

function getFlowEdges(flow: Flow): FlowEdge[] {
  const { triggers, steps } = flow.spec;
  if (triggers.length !== 1) {
    throw new FlowError(`expected 1 Flow trigger but got: ${triggers.length}`);
  }
  const trigger = triggers[0];
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

class FlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { Flow };
