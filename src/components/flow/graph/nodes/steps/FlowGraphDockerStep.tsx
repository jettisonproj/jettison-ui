import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  FlowGraphLoading,
  FlowGraphNode,
  FlowGraphNodeInfo,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import type {
  DockerBuildTestPublishStep,
  DockerBuildTestStep,
} from "src/data/types/flowTypes.ts";
import { StepSources } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  BUILD_DISPLAY_NAME,
  getStepDetailsLink,
  PUBLISH_DISPLAY_NAME,
} from "src/utils/flowUtil.ts";
import { getRepoCommitPathLink } from "src/utils/gitUtil.ts";
import {
  getLastWorkflowNodeForStep,
  getNodeDockerfilePath,
  getWorkflowRepo,
  getWorkflowRevision,
} from "src/utils/workflowUtil.ts";

interface FlowGraphDockerStepProps {
  repoOrg: string;
  repoName: string;
  step: DockerBuildTestStep | DockerBuildTestPublishStep;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphDockerStep({
  repoOrg,
  repoName,
  step,
  isPrFlow,
  workflows,
}: FlowGraphDockerStepProps) {
  const displayEvent = getDisplayEvent(step);
  const stepDetailsLink = getStepDetailsLink(repoOrg, repoName, isPrFlow, step);

  return (
    <FlowGraphNode
      headerClass={styles.nodeRowHeader}
      headerLink={stepDetailsLink}
      titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
      titleText={displayEvent}
    >
      <FlowGraphDockerNode
        step={step}
        isPrFlow={isPrFlow}
        workflows={workflows}
      />
    </FlowGraphNode>
  );
}

interface FlowGraphDockerNodeProps {
  step: DockerBuildTestStep | DockerBuildTestPublishStep;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphDockerNode({
  step,
  isPrFlow,
  workflows,
}: FlowGraphDockerNodeProps) {
  const workflowNode = getLastWorkflowNodeForStep(step, workflows);
  if (workflowNode == null) {
    return <FlowGraphLoading />;
  }
  const { workflow, node } = workflowNode;
  const { parameterMap: workflowParameters } = workflow.memo;
  const { parameterMap: nodeParameters } = node;

  const repoUrl = getWorkflowRepo(workflowParameters);
  const commitSha = getWorkflowRevision(workflowParameters);
  const dockerfilePath = getNodeDockerfilePath(nodeParameters);
  const repoLink = getRepoCommitPathLink(repoUrl, commitSha, dockerfilePath);
  return (
    <>
      <FlowGraphNodeInfo isPrFlow={isPrFlow} workflowNode={workflowNode} />
      <div className={styles.nodeDivider} />
      <a
        className={styles.nodeRowLink}
        href={repoLink}
        target="_blank"
        rel="noreferrer"
      >
        <i className={`nf nf-fa-file_text_o ${styles.dockerfileIcon}`} />{" "}
        <span className={styles.nodeText}>{dockerfilePath}</span>
      </a>
    </>
  );
}

function getDisplayEvent(
  step: DockerBuildTestStep | DockerBuildTestPublishStep,
) {
  switch (step.stepSource) {
    case StepSources.DockerBuildTest:
      return BUILD_DISPLAY_NAME;
    case StepSources.DockerBuildTestPublish:
      return PUBLISH_DISPLAY_NAME;
    default:
      step satisfies never;
      console.log("unknown step");
      console.log(step);
      throw new FlowGraphDockerStepError("invalid step source");
  }
}

class FlowGraphDockerStepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowGraphDockerStep };
