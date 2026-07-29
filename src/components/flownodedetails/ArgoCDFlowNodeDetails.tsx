import type { JSX } from "react";
import { useContext } from "react";

import type { FlowNode } from "src/components/flow/graph/FlowGraph.tsx";
import { FlowGraph } from "src/components/flow/graph/FlowGraph.tsx";
import styles from "src/components/flownodedetails/ArgoCDFlowNodeDetails.module.css";
import { ArgoCDDeploySteps } from "src/components/flownodedetails/deploysteps/ArgoCDDeploySteps.tsx";
import { FlowNodeHistory } from "src/components/flownodedetails/history/FlowNodeHistory.tsx";
import { ArgoCDPodResources } from "src/components/flownodedetails/podresources/ArgoCDPodResources.tsx";
import type {
  Application,
  ApplicationStatusResource,
} from "src/data/types/applicationTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { ApplicationsContext } from "src/providers/provider.tsx";
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

function getRolloutResource(
  application?: Application,
): ApplicationStatusResource | null {
  if (application == null) {
    return null;
  }
  const rolloutResources = [];
  for (const resource of application.status.resources) {
    if (resource.kind === ResourceKinds.Rollout) {
      rolloutResources.push(resource);
    }
  }
  if (rolloutResources.length !== 1) {
    const { namespace, name } = application.metadata;
    throw new ArgoCDFlowNodeDetailsError(
      "Expected a single rollout in application " +
        `namespace=${namespace} name=${name}`,
    );
  }
  const rolloutResource = rolloutResources[0];
  if (rolloutResource == null) {
    const { namespace, name } = application.metadata;
    throw new ArgoCDFlowNodeDetailsError(
      "Expected a single rollout in application " +
        `namespace=${namespace} name=${name}`,
    );
  }
  return rolloutResource;
}

class ArgoCDFlowNodeDetailsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { ArgoCDFlowNodeDetails };
