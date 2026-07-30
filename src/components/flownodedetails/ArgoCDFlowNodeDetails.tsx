import type { JSX } from "react";
import { useContext } from "react";

import type { FlowNode } from "src/components/flow/graph/FlowGraph.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import styles from "src/components/flownodedetails/ArgoCDFlowNodeDetails.module.css";
import { ArgoCDDeploySteps } from "src/components/flownodedetails/deploysteps/ArgoCDDeploySteps.tsx";
import { FlowNodeHistory } from "src/components/flownodedetails/history/FlowNodeHistory.tsx";
import { ArgoCDPodResources } from "src/components/flownodedetails/podresources/ArgoCDPodResources.tsx";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { ApplicationsContext } from "src/providers/provider.tsx";
import { getRolloutResource } from "src/utils/applicationUtil.ts";
import { getWorkflowRevision } from "src/utils/workflowUtil.ts";

interface ArgoCDFlowNodeDetailsProps {
  repoOrg: string;
  nodeName: string;
  isPrFlow: boolean;
  flowNodeBaseUrl: string;
  selectedWorkflow?: string;
  stepNode: FlowNode;
  sortedWorkflows: Workflow[];
  step: ArgoCDStep;
}
function ArgoCDFlowNodeDetails({
  repoOrg,
  nodeName,
  isPrFlow,
  flowNodeBaseUrl,
  selectedWorkflow,
  stepNode,
  sortedWorkflows,
  step,
}: ArgoCDFlowNodeDetailsProps): JSX.Element {
  const lastWorkflow = sortedWorkflows[0];
  const lastWorkflowRevision =
    lastWorkflow && getWorkflowRevision(lastWorkflow.memo.parameterMap);
  return (
    <>
      <FlowGraph flowNodes={[stepNode]} flowEdges={[]} />
      <ArgoCDRolloutDetails
        step={step}
        lastWorkflowRevision={lastWorkflowRevision}
      />
      <h2 className={styles.sectionTitle}>Deployment History</h2>
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

interface ArgoCDRolloutDetailsProps {
  step: ArgoCDStep;
  lastWorkflowRevision: string | undefined;
}
function ArgoCDRolloutDetails({
  step,
  lastWorkflowRevision,
}: ArgoCDRolloutDetailsProps): JSX.Element {
  const applications = useContext(ApplicationsContext);

  const { repoUrl, repoPath } = step;
  const application = applications?.get(repoUrl)?.get(repoPath);
  const rolloutResource = getRolloutResource(application);

  return (
    <>
      <ArgoCDDeploySteps rolloutResource={rolloutResource} />
      <ArgoCDPodResources
        step={step}
        application={application}
        rolloutResource={rolloutResource}
        lastWorkflowRevision={lastWorkflowRevision}
      />
    </>
  );
}

export { ArgoCDFlowNodeDetails };
