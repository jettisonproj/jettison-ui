import { useContext } from "react";
import { useParams } from "react-router";

import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import { getFlowTrigger } from "src/components/flow/flowUtil.ts";
import { FlowsContext } from "src/providers/provider.tsx";
import { TriggerLinks } from "src/components/nodedetails/nodelinks/TriggerLinks.tsx";
import { StepLinks } from "src/components/nodedetails/nodelinks/StepLinks.tsx";
import {
  getFlowStepNode,
  getFlowTriggerNode,
} from "src/components/flow/flowComponentsUtil.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import { Header } from "src/components/header/Header.tsx";
import { Content } from "src/components/content/Content.tsx";
import { isPullRequestTrigger } from "src/components/flow/flowUtil.ts";
import { NodeDetailsNavHeader } from "src/components/header/NavHeader.tsx";

function NodeDetails() {
  const { namespace, flowName, nodeName } = useParams();
  if (!namespace || !flowName || !nodeName) {
    throw new NodeDetailsError(
      `path parameters cannot be empty: namespace=${namespace} flowName=${flowName} nodeName=${nodeName}`,
    );
  }

  return (
    <>
      <Header />
      <Content>
        <NodeDetailsNavHeader
          namespace={namespace}
          flowName={flowName}
          nodeName={nodeName}
        />
        <NodeDetailsItem
          namespace={namespace}
          flowName={flowName}
          nodeName={nodeName}
        />
      </Content>
    </>
  );
}

interface NodeDetailsItemProps {
  namespace: string;
  flowName: string;
  nodeName: string;
}
function NodeDetailsItem({
  namespace,
  flowName,
  nodeName,
}: NodeDetailsItemProps) {
  const flows = useContext(FlowsContext);
  if (flows == null) {
    return <i className="nf nf-fa-spinner" />;
  }
  const flow = flows.get(namespace)?.get(flowName);
  if (flow == null) {
    return (
      <p>
        There is no flow{" "}
        <strong>
          {namespace}/{flowName}
        </strong>
        . Would you like to create one?
      </p>
    );
  }

  const trigger = flow.spec.triggers.find(
    (trigger) => flowDefaultTriggerName(trigger) === nodeName,
  );
  if (trigger) {
    const isPrFlow = isPullRequestTrigger(trigger);
    const triggerNode = getFlowTriggerNode(
      namespace,
      flowName,
      trigger,
      isPrFlow,
    );
    return (
      <>
        <FlowGraph flowNodes={[triggerNode]} flowEdges={[]} />
        <TriggerLinks trigger={trigger} />
      </>
    );
  }
  const step = flow.spec.steps.find(
    (step) => flowDefaultStepName(step) === nodeName,
  );
  if (step) {
    const trigger = getFlowTrigger(flow);
    const stepNode = getFlowStepNode(namespace, flowName, step, trigger);
    return (
      <>
        <FlowGraph flowNodes={[stepNode]} flowEdges={[]} />
        <StepLinks step={step} trigger={trigger} />
      </>
    );
  }
  return (
    <p>
      Did not find <strong>{nodeName}</strong> in flow{" "}
      <strong>
        {namespace}/{flowName}
      </strong>
    </p>
  );
}

class NodeDetailsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { NodeDetails };
