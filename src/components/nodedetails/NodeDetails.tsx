import { useContext, useMemo } from "react";
import { useParams } from "react-router";

import { localState } from "src/localState.ts";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import { getFlowTrigger } from "src/components/flow/flowUtil.ts";
import type { Flow } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { FlowsContext, WorkflowsContext } from "src/providers/provider.tsx";
import { TriggerLinks } from "src/components/nodedetails/nodelinks/TriggerLinks.tsx";
import { StepLinks } from "src/components/nodedetails/nodelinks/StepLinks.tsx";
import {
  getFlowStepNode,
  getFlowTriggerNode,
} from "src/components/flow/flowComponentsUtil.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import { Header } from "src/components/header/Header.tsx";
import { isPullRequestTrigger } from "src/components/flow/flowUtil.ts";
import { NodeDetailsNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";

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
  const allWorkflows = useContext(WorkflowsContext);
  if (flows == null || allWorkflows == null) {
    return <LoadIcon />;
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
  localState.addRecentFlow(namespace, flowName);

  const workflows = allWorkflows.get(namespace)?.get(flowName);
  return (
    <NodeWorkflowDetails
      namespace={namespace}
      flowName={flowName}
      nodeName={nodeName}
      flow={flow}
      workflows={workflows}
    />
  );
}

interface NodeWorkflowDetailsProps extends NodeDetailsItemProps {
  flow: Flow;
  workflows: Map<string, Workflow> | undefined;
}
function NodeWorkflowDetails({
  namespace,
  flowName,
  nodeName,
  flow,
  workflows,
}: NodeWorkflowDetailsProps) {
  const sortedWorkflows = useMemo(() => {
    if (workflows == null) {
      return [];
    }
    return Array.from(workflows.values()).sort(
      (a, b) => b.memo.startedAt.getTime() - a.memo.startedAt.getTime(),
    );
  }, [workflows]);
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
      sortedWorkflows,
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
    const isPrFlow = isPullRequestTrigger(trigger);
    const stepNode = getFlowStepNode(
      namespace,
      flowName,
      step,
      isPrFlow,
      sortedWorkflows,
    );
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
