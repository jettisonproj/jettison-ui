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
  const { repoOrg, repoName, flowName, nodeName } = useParams();
  if (!repoOrg || !repoName || !flowName || !nodeName) {
    throw new NodeDetailsError(
      "path parameters cannot be empty: " +
        `repoOrg=${repoOrg} repoName=${repoName} flowName=${flowName} nodeName=${nodeName}`,
    );
  }

  return (
    <>
      <Header />
      <NodeDetailsNavHeader
        repoOrg={repoOrg}
        repoName={repoName}
        flowName={flowName}
        nodeName={nodeName}
      />
      <NodeDetailsItem
        repoOrg={repoOrg}
        repoName={repoName}
        flowName={flowName}
        nodeName={nodeName}
      />
    </>
  );
}

interface NodeDetailsItemProps {
  repoOrg: string;
  repoName: string;
  flowName: string;
  nodeName: string;
}
function NodeDetailsItem({
  repoOrg,
  repoName,
  flowName,
  nodeName,
}: NodeDetailsItemProps) {
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

  const workflows = allWorkflows.get(repoOrg)?.get(flowName);
  return (
    <NodeWorkflowDetails
      repoOrg={repoOrg}
      repoName={repoName}
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
  repoOrg,
  repoName,
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
      repoOrg,
      repoName,
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
      repoOrg,
      repoName,
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
        {repoOrg}/{flowName}
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
