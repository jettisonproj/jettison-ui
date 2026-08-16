import type { JSX } from "react";
import { useContext } from "react";

import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  FlowGraphLoading,
  FlowGraphNode,
  FlowGraphNodeInfo,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import { getArgoCDStatus } from "src/components/flow/graph/nodes/steps/argocdStatusUtil.ts";
import { FlowGraphArgoCDStatus } from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDStatus.tsx";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  ApplicationsContext,
  RolloutsContext,
} from "src/providers/provider.tsx";
import { getStepDetailsLink } from "src/utils/flowUtil.ts";
import { getDisplayRepoPath, getRepoPathLink } from "src/utils/gitUtil.ts";
import { getLastWorkflowNodeForStep } from "src/utils/workflowUtil.ts";

interface FlowGraphArgoCDStepProps {
  repoOrg: string;
  repoName: string;
  step: ArgoCDStep;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphArgoCDStep({
  repoOrg,
  repoName,
  step,
  isPrFlow,
  workflows,
}: FlowGraphArgoCDStepProps): JSX.Element {
  const { repoUrl, repoPath, baseRef } = step;
  const displayRepoPath = getDisplayRepoPath(repoPath, repoPath);
  const stepDetailsLink = getStepDetailsLink(repoOrg, repoName, isPrFlow, step);
  const repoLink = getRepoPathLink(repoUrl, baseRef, repoPath);
  const workflowNode = getLastWorkflowNodeForStep(step, workflows);
  return (
    <FlowGraphNode
      headerClass={styles.nodeRowHeader}
      headerLink={stepDetailsLink}
      titleIcon={`nf nf-md-kubernetes ${styles.k8sIcon}`}
      titleText={displayRepoPath}
    >
      {workflowNode == null && <FlowGraphLoading />}
      {workflowNode != null && (
        <FlowGraphNodeInfo isPrFlow={isPrFlow} workflowNode={workflowNode} />
      )}
      <div className={styles.nodeDivider} />
      <a
        className={styles.nodeRowLink}
        href={repoLink}
        target="_blank"
        rel="noreferrer"
      >
        <i className={`nf nf-fa-layer_group ${styles.infraIcon}`} />
        <span className={styles.nodeTextSub}>Infrastructure</span>
      </a>
      <FlowGraphArgoCDStatusRow
        step={step}
        stepDetailsLink={stepDetailsLink}
        workflow={workflowNode?.workflow}
      />
    </FlowGraphNode>
  );
}

interface FlowGraphArgoCDStatusRowProps {
  step: ArgoCDStep;
  stepDetailsLink: string;
  workflow: Workflow | undefined;
}
function FlowGraphArgoCDStatusRow({
  step,
  stepDetailsLink,
  workflow,
}: FlowGraphArgoCDStatusRowProps): JSX.Element {
  const applications = useContext(ApplicationsContext);
  const rollouts = useContext(RolloutsContext);

  const argocdStatusResponse = getArgoCDStatus(
    step,
    workflow,
    applications,
    rollouts,
  );
  return (
    <div className={styles.nodeRowBlock}>
      <FlowGraphArgoCDStatus
        stepDetailsLink={stepDetailsLink}
        argocdStatusResponse={argocdStatusResponse}
      />
    </div>
  );
}

export { FlowGraphArgoCDStep };
