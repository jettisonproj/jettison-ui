import { useContext, useMemo } from "react";
import { useParams } from "react-router";

import { localState } from "src/localState.ts";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
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
import { NodeDetailsNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { pushTriggerRoute, prTriggerRoute } from "src/routes.ts";
import { getTriggerDisplayName } from "src/utils/flowUtil.ts";

function NodeDetails() {
  const { repoOrg, repoName, triggerRoute, nodeName } = useParams();
  if (!repoOrg || !repoName || !triggerRoute || !nodeName) {
    throw new NodeDetailsError(
      "path parameters cannot be empty: " +
        `repoOrg=${repoOrg} repoName=${repoName} triggerRoute=${triggerRoute} nodeName=${nodeName}`,
    );
  }

  if (triggerRoute !== pushTriggerRoute && triggerRoute !== prTriggerRoute) {
    throw new NodeDetailsError(
      `invalid path parameter triggerRoute=${triggerRoute}`,
    );
  }

  const isPrFlow = triggerRoute === prTriggerRoute;
  return (
    <>
      <Header />
      <NodeDetailsNavHeader
        repoOrg={repoOrg}
        repoName={repoName}
        isPrFlow={isPrFlow}
        nodeName={nodeName}
      />
      <NodeDetailsItem
        repoOrg={repoOrg}
        repoName={repoName}
        isPrFlow={isPrFlow}
        nodeName={nodeName}
      />
    </>
  );
}

interface NodeDetailsItemProps {
  repoOrg: string;
  repoName: string;
  isPrFlow: boolean;
  nodeName: string;
}
function NodeDetailsItem({
  repoOrg,
  repoName,
  isPrFlow,
  nodeName,
}: NodeDetailsItemProps) {
  const flows = useContext(FlowsContext);
  const allWorkflows = useContext(WorkflowsContext);
  if (flows == null || allWorkflows == null) {
    return <LoadIcon />;
  }
  const pushPrFlows = flows.get(`${repoOrg}/${repoName}`);
  if (pushPrFlows == null) {
    localState.deleteRecentRepo(repoOrg, repoName);
    return (
      <p>
        There are no flows in repo{" "}
        <strong>
          {repoOrg}/{repoName}
        </strong>
        . Would you like to create one?
      </p>
    );
  }
  let flow;
  if (isPrFlow) {
    flow = pushPrFlows.prFlow;
  } else {
    flow = pushPrFlows.pushFlow;
  }
  if (flow == null) {
    localState.deleteRecentRepo(repoOrg, repoName);
    const triggerDisplayName = getTriggerDisplayName(isPrFlow);
    return (
      <p>
        There is no <strong>{triggerDisplayName}</strong> flow in repo{" "}
        <strong>
          {repoOrg}/{repoName}
        </strong>
        . Would you like to create one?
      </p>
    );
  }
  localState.addRecentRepo(repoOrg, repoName);

  const { name: flowName } = flow.metadata;
  const workflows = allWorkflows.get(repoOrg)?.get(flowName);
  return (
    <NodeWorkflowDetails
      repoOrg={repoOrg}
      repoName={repoName}
      nodeName={nodeName}
      isPrFlow={isPrFlow}
      flow={flow}
      workflows={workflows}
    />
  );
}

interface NodeWorkflowDetailsProps {
  repoOrg: string;
  repoName: string;
  nodeName: string;
  isPrFlow: boolean;
  flow: Flow;
  workflows: Map<string, Workflow> | undefined;
}
function NodeWorkflowDetails({
  repoOrg,
  repoName,
  nodeName,
  isPrFlow,
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
    const triggerNode = getFlowTriggerNode(
      repoOrg,
      repoName,
      trigger,
      flow.memo.isPrFlow,
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
    const { trigger, isPrFlow } = flow.memo;
    const stepNode = getFlowStepNode(
      repoOrg,
      repoName,
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
  const triggerDisplayName = getTriggerDisplayName(isPrFlow);
  return (
    <p>
      Did not find <strong>{nodeName}</strong> in{" "}
      <strong>{triggerDisplayName}</strong> flow in repo{" "}
      <strong>
        {repoOrg}/{repoName}
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
