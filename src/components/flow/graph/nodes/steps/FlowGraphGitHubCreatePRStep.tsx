import type { JSX } from "react";

import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  FlowGraphLoading,
  FlowGraphNode,
  FlowGraphNodeInfo,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import type { GitHubCreatePRStep } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  CREATE_PR_DISPLAY_NAME,
  getStepDetailsLink,
} from "src/utils/flowUtil.ts";
import {
  getRepoOrgAndName,
  getRepoPrLink,
  getRepoPrsLink,
} from "src/utils/gitUtil.ts";
import {
  getLastWorkflowNodeForStep,
  getMemoCreatedPrNumber,
  getMemoTargetRepo,
  getMemoTargetRepoShortName,
} from "src/utils/workflowUtil.ts";

interface FlowGraphGitHubCreatePRStepProps {
  repoOrg: string;
  repoName: string;
  step: GitHubCreatePRStep;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphGitHubCreatePRStep({
  repoOrg,
  repoName,
  step,
  isPrFlow,
  workflows,
}: FlowGraphGitHubCreatePRStepProps): JSX.Element {
  const stepDetailsLink = getStepDetailsLink(repoOrg, repoName, isPrFlow, step);

  return (
    <FlowGraphNode
      headerClass={styles.nodeRowHeader}
      headerLink={stepDetailsLink}
      titleIcon={`nf nf-md-source_pull ${styles.createPrIcon}`}
      titleText={CREATE_PR_DISPLAY_NAME}
    >
      <FlowGraphGitHubCreatePRNode
        step={step}
        isPrFlow={isPrFlow}
        workflows={workflows}
      />
    </FlowGraphNode>
  );
}

interface FlowGraphGitHubCreatePRNodeProps {
  step: GitHubCreatePRStep;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphGitHubCreatePRNode({
  step,
  isPrFlow,
  workflows,
}: FlowGraphGitHubCreatePRNodeProps): JSX.Element {
  const workflowNode = getLastWorkflowNodeForStep(step, workflows);
  if (workflowNode == null) {
    return <FlowGraphLoading />;
  }
  const { node } = workflowNode;
  const { parameterMap, templateParameterMap, outputMap } = node;

  const targetRepo = getMemoTargetRepo(parameterMap, templateParameterMap);
  const targetRepoOrgName = getMemoTargetRepoShortName(
    parameterMap,
    templateParameterMap,
  );
  const targetPrNumber = getMemoCreatedPrNumber(outputMap);

  const [, targetRepoName] = getRepoOrgAndName(targetRepoOrgName);

  let targetPrLink;
  let targetPrDisplayName;
  if (targetPrNumber == null || targetPrNumber === "0") {
    targetPrLink = getRepoPrsLink(targetRepo);
    targetPrDisplayName = `${targetRepoName}#pulls`;
  } else {
    targetPrLink = getRepoPrLink(targetRepo, targetPrNumber);
    targetPrDisplayName = `${targetRepoName}#${targetPrNumber}`;
  }

  return (
    <>
      <FlowGraphNodeInfo isPrFlow={isPrFlow} workflowNode={workflowNode} />
      <div className={styles.nodeDivider} />
      <a
        className={styles.nodeRowLink}
        href={targetPrLink}
        target="_blank"
        rel="noreferrer"
      >
        <i className={`nf nf-md-source_pull ${styles.prIcon}`} />
        <span className={styles.nodeTextSub}>{targetPrDisplayName}</span>
      </a>
    </>
  );
}

export { FlowGraphGitHubCreatePRStep };
