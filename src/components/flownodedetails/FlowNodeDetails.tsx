import { useContext, useMemo } from "react";
import { useParams } from "react-router";

import {
  getFlowStepNode,
  getFlowTriggerNode,
} from "src/components/flow/flowComponentsUtil.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import { ArgoCDFlowNodeDetails } from "src/components/flownodedetails/ArgoCDFlowNodeDetails.tsx";
import { FlowNodeHistory } from "src/components/flownodedetails/FlowNodeHistory.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowNodeDetailsNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import type { Flow } from "src/data/types/flowTypes.ts";
import { StepSources } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { localState } from "src/localState.ts";
import { FlowsContext, WorkflowsContext } from "src/providers/provider.tsx";
import { prTriggerRoute, pushTriggerRoute, routes } from "src/routes.ts";
import { getTriggerDisplayName } from "src/utils/flowUtil.ts";
import {
  doesWorkflowExecuteNode,
  doesWorkflowExecuteTriggerNode,
  TRIGGER_NODE_NAME,
  workflowCompareFn,
} from "src/utils/workflowUtil.ts";

function FlowNodeDetails() {
  const { repoOrg, repoName, triggerRoute, nodeName, selectedWorkflow } =
    useParams();
  if (!repoOrg || !repoName || !triggerRoute || !nodeName) {
    throw new FlowNodeDetailsError(
      "path parameters cannot be empty: " +
        `repoOrg=${repoOrg} repoName=${repoName} triggerRoute=${triggerRoute} nodeName=${nodeName}`,
    );
  }

  if (triggerRoute !== pushTriggerRoute && triggerRoute !== prTriggerRoute) {
    throw new FlowNodeDetailsError(
      `invalid path parameter triggerRoute=${triggerRoute}`,
    );
  }

  const flowNodeBaseUrl = `${routes.flows}/${repoOrg}/${repoName}/${triggerRoute}/${nodeName}`;
  const isPrFlow = triggerRoute === prTriggerRoute;
  return (
    <>
      <Header />
      <FlowNodeDetailsNavHeader
        repoOrg={repoOrg}
        repoName={repoName}
        isPrFlow={isPrFlow}
        nodeName={nodeName}
      />
      <FlowNodeDetailsItem
        repoOrg={repoOrg}
        repoName={repoName}
        isPrFlow={isPrFlow}
        flowNodeBaseUrl={flowNodeBaseUrl}
        selectedWorkflow={selectedWorkflow}
        nodeName={nodeName}
      />
    </>
  );
}

interface FlowNodeDetailsItemProps {
  repoOrg: string;
  repoName: string;
  isPrFlow: boolean;
  flowNodeBaseUrl: string;
  selectedWorkflow?: string;
  nodeName: string;
}
function FlowNodeDetailsItem({
  repoOrg,
  repoName,
  isPrFlow,
  flowNodeBaseUrl,
  selectedWorkflow,
  nodeName,
}: FlowNodeDetailsItemProps) {
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
    <FlowNodeWorkflowDetails
      repoOrg={repoOrg}
      repoName={repoName}
      nodeName={nodeName}
      isPrFlow={isPrFlow}
      flowNodeBaseUrl={flowNodeBaseUrl}
      selectedWorkflow={selectedWorkflow}
      flow={flow}
      workflows={workflows}
    />
  );
}

interface FlowNodeWorkflowDetailsProps {
  repoOrg: string;
  repoName: string;
  nodeName: string;
  isPrFlow: boolean;
  flowNodeBaseUrl: string;
  selectedWorkflow?: string;
  flow: Flow;
  workflows: Map<string, Workflow> | undefined;
}
function FlowNodeWorkflowDetails({
  repoOrg,
  repoName,
  nodeName,
  isPrFlow,
  flowNodeBaseUrl,
  selectedWorkflow,
  flow,
  workflows,
}: FlowNodeWorkflowDetailsProps) {
  const trigger = flow.spec.triggers.find(
    (trigger) => flowDefaultTriggerName(trigger) === nodeName,
  );
  const sortedWorkflows = useMemo(() => {
    if (workflows == null) {
      return [];
    }
    return Array.from(workflows.values())
      .filter((workflow) => {
        if (trigger != null) {
          return doesWorkflowExecuteTriggerNode(workflow);
        }
        return doesWorkflowExecuteNode(workflow, nodeName);
      })
      .sort(workflowCompareFn);
  }, [workflows, nodeName, trigger]);
  if (trigger != null) {
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
        <FlowNodeHistory
          isPrFlow={isPrFlow}
          flowNodeBaseUrl={flowNodeBaseUrl}
          repoOrg={repoOrg}
          workflows={sortedWorkflows}
          selectedWorkflow={selectedWorkflow}
          nodeName={TRIGGER_NODE_NAME}
        />
      </>
    );
  }
  const step = flow.spec.steps.find(
    (step) => flowDefaultStepName(step) === nodeName,
  );
  if (step != null) {
    const { isPrFlow } = flow.memo;
    const stepNode = getFlowStepNode(
      repoOrg,
      repoName,
      step,
      isPrFlow,
      sortedWorkflows,
    );
    if (step.stepSource === StepSources.ArgoCD) {
      return (
        <ArgoCDFlowNodeDetails
          repoOrg={repoOrg}
          nodeName={nodeName}
          isPrFlow={isPrFlow}
          flowNodeBaseUrl={flowNodeBaseUrl}
          selectedWorkflow={selectedWorkflow}
          stepNode={stepNode}
          sortedWorkflows={sortedWorkflows}
          step={step}
        />
      );
    }
    return (
      <>
        <FlowGraph flowNodes={[stepNode]} flowEdges={[]} />
        <FlowNodeHistory
          isPrFlow={isPrFlow}
          flowNodeBaseUrl={flowNodeBaseUrl}
          repoOrg={repoOrg}
          workflows={sortedWorkflows}
          selectedWorkflow={selectedWorkflow}
          nodeName={nodeName}
        />
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

class FlowNodeDetailsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowNodeDetails };
