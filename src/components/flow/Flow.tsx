import { useContext, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";

import {
  getFlowStepNode,
  getFlowTriggerNode,
} from "src/components/flow/flowComponentsUtil.tsx";
import type {
  FlowEdge,
  FlowNode,
} from "src/components/flow/graph/FlowGraph.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import { FlowHistory } from "src/components/flow/history/FlowHistory.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import type { Flow as FlowType, Trigger } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { localState } from "src/localState.ts";
import { FlowsContext, WorkflowsContext } from "src/providers/provider.tsx";
import {
  getRequiredParam,
  getTriggerRouteParam,
  isTriggerRouteForPrFlow,
  routes,
} from "src/routes.ts";
import { getTriggerDisplayName } from "src/utils/flowUtil.ts";
import {
  TRIGGER_NODE_NAME,
  workflowCompareFn,
} from "src/utils/workflowUtil.ts";

function Flow() {
  const routerParams = useParams();
  const repoOrg = getRequiredParam(routerParams, "repoOrg");
  const repoName = getRequiredParam(routerParams, "repoName");
  const triggerRoute = getTriggerRouteParam(routerParams);
  const { selectedWorkflow } = routerParams;

  const [searchParams] = useSearchParams();

  const selectedNodeName = searchParams.get("node") ?? TRIGGER_NODE_NAME;
  const flowBaseUrl = `${routes.flows}/${repoOrg}/${repoName}/${triggerRoute}`;
  const isPrFlow = isTriggerRouteForPrFlow(triggerRoute);
  return (
    <>
      <Header />
      <FlowItem
        repoOrg={repoOrg}
        repoName={repoName}
        isPrFlow={isPrFlow}
        flowBaseUrl={flowBaseUrl}
        selectedWorkflow={selectedWorkflow}
        selectedNodeName={selectedNodeName}
      />
    </>
  );
}

interface FlowItemProps {
  repoOrg: string;
  repoName: string;
  isPrFlow: boolean;
  flowBaseUrl: string;
  selectedWorkflow?: string;
  selectedNodeName: string;
}

function FlowItem({
  repoOrg,
  repoName,
  isPrFlow,
  flowBaseUrl,
  selectedWorkflow,
  selectedNodeName,
}: FlowItemProps) {
  const flows = useContext(FlowsContext);
  const allWorkflows = useContext(WorkflowsContext);
  if (flows == null || allWorkflows == null) {
    return (
      <>
        <FlowNavHeader
          repoOrg={repoOrg}
          repoName={repoName}
          isPrFlow={isPrFlow}
        />
        <LoadIcon />
      </>
    );
  }
  const pushPrFlows = flows.get(`${repoOrg}/${repoName}`);
  if (pushPrFlows == null) {
    localState.deleteRecentRepo(repoOrg, repoName);
    return (
      <>
        <FlowNavHeader
          repoOrg={repoOrg}
          repoName={repoName}
          isPrFlow={isPrFlow}
        />
        <p>
          There are no flows in repo{" "}
          <strong>
            {repoOrg}/{repoName}
          </strong>
          . Would you like to create one?
        </p>
      </>
    );
  }

  let flow;
  let additionalFlow;
  if (isPrFlow) {
    flow = pushPrFlows.prFlow;
    additionalFlow = pushPrFlows.pushFlow;
  } else {
    flow = pushPrFlows.pushFlow;
    additionalFlow = pushPrFlows.prFlow;
  }
  if (flow == null) {
    localState.deleteRecentRepo(repoOrg, repoName);
    const triggerDisplayName = getTriggerDisplayName(isPrFlow);
    return (
      <>
        <FlowNavHeader
          repoOrg={repoOrg}
          repoName={repoName}
          isPrFlow={isPrFlow}
        />
        <p>
          There is no <strong>{triggerDisplayName}</strong> flow in repo{" "}
          <strong>
            {repoOrg}/{repoName}
          </strong>
          . Would you like to create one?
        </p>
      </>
    );
  }
  localState.addRecentRepo(repoOrg, repoName);

  const { name: flowName } = flow.metadata;
  // The repoOrg and namespace are expected to match
  const workflows = allWorkflows.get(repoOrg)?.get(flowName);
  const additionalWorkflows =
    additionalFlow &&
    allWorkflows.get(repoOrg)?.get(additionalFlow.metadata.name);
  return (
    <>
      <FlowNavHeader
        repoOrg={repoOrg}
        repoName={repoName}
        isPrFlow={isPrFlow}
        additionalWorkflows={additionalWorkflows}
      />
      <FlowWorkflowsItem
        repoOrg={repoOrg}
        repoName={repoName}
        flow={flow}
        workflows={workflows}
        flowBaseUrl={flowBaseUrl}
        selectedWorkflow={selectedWorkflow}
        selectedNodeName={selectedNodeName}
      />
    </>
  );
}

interface FlowWorkflowsItemProps {
  repoOrg: string;
  repoName: string;
  flow: FlowType;
  workflows: Map<string, Workflow> | undefined;
  flowBaseUrl: string;
  selectedWorkflow?: string;
  selectedNodeName: string;
}
function FlowWorkflowsItem({
  repoOrg,
  repoName,
  flow,
  workflows,
  flowBaseUrl,
  selectedWorkflow,
  selectedNodeName,
}: FlowWorkflowsItemProps) {
  const sortedWorkflows = useMemo(() => {
    if (workflows == null) {
      return [];
    }
    return Array.from(workflows.values()).sort(workflowCompareFn);
  }, [workflows]);

  const { trigger, isPrFlow } = flow.memo;
  const flowNodes = getFlowNodes(
    repoOrg,
    repoName,
    flow,
    trigger,
    isPrFlow,
    sortedWorkflows,
  );
  const flowEdges = getFlowEdges(flow, trigger);

  return (
    <>
      <FlowGraph flowNodes={flowNodes} flowEdges={flowEdges} />
      <FlowHistory
        isPrFlow={isPrFlow}
        flowSteps={flow.spec.steps}
        repoOrg={repoOrg}
        workflows={sortedWorkflows}
        flowBaseUrl={flowBaseUrl}
        selectedWorkflow={selectedWorkflow}
        selectedNodeName={selectedNodeName}
      />
    </>
  );
}

function getFlowNodes(
  repoOrg: string,
  repoName: string,
  flow: FlowType,
  trigger: Trigger,
  isPrFlow: boolean,
  workflows: Workflow[],
): FlowNode[] {
  const triggerNode = getFlowTriggerNode(
    repoOrg,
    repoName,
    trigger,
    isPrFlow,
    workflows,
  );

  const { steps } = flow.spec;
  const stepNodes = steps.map((step) =>
    getFlowStepNode(repoOrg, repoName, step, isPrFlow, workflows),
  );

  return [triggerNode].concat(stepNodes);
}

function getFlowEdges(flow: FlowType, trigger: Trigger): FlowEdge[] {
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
