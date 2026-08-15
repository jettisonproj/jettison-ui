import type { JSX } from "react";

import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  FlowGraphLoading,
  FlowGraphNode,
  FlowGraphNodeInfo,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import { FlowGraphArgoCDStatus } from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDStatus.tsx";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
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
      <div className={styles.nodeRowBlock}>
        <FlowGraphArgoCDStatus
          step={step}
          stepDetailsLink={stepDetailsLink}
          workflowNode={workflowNode}
        />
      </div>
    </FlowGraphNode>
  );
}

export { FlowGraphArgoCDStep };
