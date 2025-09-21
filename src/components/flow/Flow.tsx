import { useContext, useMemo } from "react";
import { useParams } from "react-router";

import { localState } from "src/localState.ts";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import { FlowsContext, WorkflowsContext } from "src/providers/provider.tsx";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import type { Flow, Trigger } from "src/data/types/flowTypes.ts";
import {
  getFlowStepNode,
  getFlowTriggerNode,
} from "src/components/flow/flowComponentsUtil.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowsNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import { FlowHistory } from "src/components/flow/history/FlowHistory.tsx";
import type {
  FlowNode,
  FlowEdge,
} from "src/components/flow/graph/FlowGraph.tsx";
import { pushTriggerRoute, prTriggerRoute } from "src/routes.ts";
import { getTriggerDisplayName } from "src/utils/flowUtil.ts";

function Flow() {
  const { repoOrg, repoName, triggerRoute } = useParams();
  if (!repoOrg || !repoName || !triggerRoute) {
    throw new FlowError(
      "path parameters cannot be empty: " +
        `repoOrg=${repoOrg} repoName=${repoName} triggerRoute=${triggerRoute}`,
    );
  }

  if (triggerRoute !== pushTriggerRoute && triggerRoute !== prTriggerRoute) {
    throw new FlowError(`invalid path parameter triggerRoute=${triggerRoute}`);
  }

  return (
    <>
      <Header />
      <FlowsNavHeader repoOrg={repoOrg} repoName={repoName} />
      <FlowItem
        repoOrg={repoOrg}
        repoName={repoName}
        isPrFlow={triggerRoute === prTriggerRoute}
      />
    </>
  );
}

interface FlowItemProps {
  repoOrg: string;
  repoName: string;
  isPrFlow: boolean;
}

function FlowItem({ repoOrg, repoName, isPrFlow }: FlowItemProps) {
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
  // The repoOrg and namespace are expected to match
  const workflows = allWorkflows.get(repoOrg)?.get(flowName);
  return (
    <FlowWorkflowsItem
      repoOrg={repoOrg}
      repoName={repoName}
      flow={flow}
      workflows={workflows}
    />
  );
}

interface FlowWorkflowsItemProps {
  repoOrg: string;
  repoName: string;
  flow: Flow;
  workflows: Map<string, Workflow> | undefined;
}
function FlowWorkflowsItem({
  repoOrg,
  repoName,
  flow,
  workflows,
}: FlowWorkflowsItemProps) {
  const sortedWorkflows = useMemo(() => {
    if (workflows == null) {
      return [];
    }
    return Array.from(workflows.values()).sort(
      (a, b) => b.memo.startedAt.getTime() - a.memo.startedAt.getTime(),
    );
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
        repoOrg={repoOrg}
        workflows={sortedWorkflows}
      />
    </>
  );
}

function getFlowNodes(
  repoOrg: string,
  repoName: string,
  flow: Flow,
  trigger: Trigger,
  isPrFlow: boolean,
  workflows: Workflow[],
): FlowNode[] {
  const { name: flowName } = flow.metadata;
  const triggerNode = getFlowTriggerNode(
    repoOrg,
    repoName,
    flowName,
    trigger,
    isPrFlow,
    workflows,
  );

  const { steps } = flow.spec;
  const stepNodes = steps.map((step) =>
    getFlowStepNode(repoOrg, repoName, flowName, step, isPrFlow, workflows),
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

class FlowError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { Flow };
