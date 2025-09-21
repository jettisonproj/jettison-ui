import { useContext, useMemo } from "react";
import { useParams } from "react-router";

import { localState } from "src/localState.ts";
import {
  FlowError,
  getFlowTrigger,
  isPullRequestTrigger,
} from "src/components/flow/flowUtil.ts";
import { flowDefaultStepName, flowDefaultTriggerName } from "src/data/data.ts";
import { FlowsContext, WorkflowsContext } from "src/providers/provider.tsx";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import type { Flow, Trigger } from "src/data/types/flowTypes.ts";
import {
  getFlowStepNode,
  getFlowTriggerNode,
} from "src/components/flow/flowComponentsUtil.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import { FlowHistory } from "src/components/flow/history/FlowHistory.tsx";
import type {
  FlowNode,
  FlowEdge,
} from "src/components/flow/graph/FlowGraph.tsx";

function Flow() {
  const { repoOrg, repoName, flowName } = useParams();
  if (!repoOrg || !repoName || !flowName) {
    throw new FlowError(
      "path parameters cannot be empty: " +
        `repoOrg=${repoOrg} repoName=${repoName} flowName=${flowName}`,
    );
  }

  return (
    <>
      <Header />
      <FlowNavHeader
        repoOrg={repoOrg}
        repoName={repoName}
        flowName={flowName}
      />
      <FlowItem repoOrg={repoOrg} repoName={repoName} flowName={flowName} />
    </>
  );
}

interface FlowItemProps {
  repoOrg: string;
  repoName: string;
  flowName: string;
}

function FlowItem({ repoOrg, repoName, flowName }: FlowItemProps) {
  const flows = useContext(FlowsContext);
  const allWorkflows = useContext(WorkflowsContext);
  if (flows == null || allWorkflows == null) {
    return <LoadIcon />;
  }
  const flow = flows.get(`${repoOrg}/${repoName}`)?.get(flowName);
  if (flow == null) {
    localState.deleteRecentRepo(repoOrg, repoName);
    return (
      <p>
        There is no flow <strong>{flowName}</strong> in repo{" "}
        <strong>
          {repoOrg}/{repoName}
        </strong>
        . Would you like to create one?
      </p>
    );
  }
  localState.addRecentRepo(repoOrg, repoName);

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

  const trigger = getFlowTrigger(flow);
  const isPrFlow = isPullRequestTrigger(trigger);
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

export { Flow };
