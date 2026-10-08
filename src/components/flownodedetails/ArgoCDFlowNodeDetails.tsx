import type { JSX } from "react";
import { useContext } from "react";

import type { FlowNode } from "src/components/flow/graph/FlowGraph.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import styles from "src/components/flownodedetails/ArgoCDFlowNodeDetails.module.css";
import { ArgoCDDeploySteps } from "src/components/flownodedetails/deploysteps/ArgoCDDeploySteps.tsx";
import { FlowNodeHistory } from "src/components/flownodedetails/history/FlowNodeHistory.tsx";
import { ArgoCDPodGrid } from "src/components/flownodedetails/podresources/ArgoCDPodGrid.tsx";
import { FlowNodeDetailsNavHeader } from "src/components/header/NavHeader.tsx";
import type { ApplicationStatusResource } from "src/data/types/applicationTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { ApplicationsContext } from "src/providers/provider.tsx";
import { getRolloutResource } from "src/utils/applicationUtil.ts";
import { getWorkflowRevision } from "src/utils/workflowUtil.ts";

interface ArgoCDFlowNodeDetailsProps {
  repoOrg: string;
  repoName: string;
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
  repoName,
  nodeName,
  isPrFlow,
  flowNodeBaseUrl,
  selectedWorkflow,
  stepNode,
  sortedWorkflows,
  step,
}: ArgoCDFlowNodeDetailsProps): JSX.Element {
  const applications = useContext(ApplicationsContext);

  const { repoUrl, repoPath } = step;
  const application = applications?.get(repoUrl)?.get(repoPath);
  const rolloutResource = getRolloutResource(application);

  const lastWorkflow = sortedWorkflows[0];
  const lastWorkflowRevision =
    lastWorkflow && getWorkflowRevision(lastWorkflow.memo.parameterMap);
  return (
    <>
      <FlowNodeDetailsNavHeader
        repoOrg={repoOrg}
        repoName={repoName}
        isPrFlow={isPrFlow}
        nodeName={nodeName}
        step={step}
        application={application}
        rolloutResource={rolloutResource}
      />
      <FlowGraph flowNodes={[stepNode]} flowEdges={[]} />
      <ArgoCDRolloutDetails
        rolloutResource={rolloutResource}
        lastWorkflowRevision={lastWorkflowRevision}
      />
      <h2 className={styles.deployHistorySectionTitle}>Deployment History</h2>
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
  lastWorkflowRevision: string | undefined;
  rolloutResource: ApplicationStatusResource | null;
}
function ArgoCDRolloutDetails({
  lastWorkflowRevision,
  rolloutResource,
}: ArgoCDRolloutDetailsProps): JSX.Element {
  return (
    <>
      <ArgoCDDeploySteps rolloutResource={rolloutResource} />
      <ArgoCDPodResources
        rolloutResource={rolloutResource}
        lastWorkflowRevision={lastWorkflowRevision}
      />
    </>
  );
}

interface ArgoCDPodResourcesProps {
  rolloutResource: ApplicationStatusResource | null;
  lastWorkflowRevision: string | undefined;
}
function ArgoCDPodResources({
  rolloutResource,
  lastWorkflowRevision,
}: ArgoCDPodResourcesProps): JSX.Element {
  return (
    <>
      <h2 className={styles.podResourcesSectionTitle}>
        <span>Pod Resources</span>
      </h2>
      <ArgoCDPodGrid
        rolloutResource={rolloutResource}
        lastWorkflowRevision={lastWorkflowRevision}
      />
    </>
  );
}
export { ArgoCDFlowNodeDetails };
