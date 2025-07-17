import {
  FlowGraphNode,
  FlowGraphCommit,
  FlowGraphTimestamp,
  FlowGraphLoading,
} from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import { getRepoCommitPathLink } from "src/utils/gitUtil.ts";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import type {
  DockerBuildTestStep,
  DockerBuildTestPublishStep,
} from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  getStepDetailsLink,
  getLastWorkflowNodeForStep,
} from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import {
  getWorkflowRepo,
  getWorkflowRevision,
  getNodeDockerfilePath,
} from "src/components/flow/workflowNodeUtil.ts";
import { StepSource } from "src/data/types/flowTypes.ts";

interface FlowGraphDockerStepProps {
  namespace: string;
  flowName: string;
  step: DockerBuildTestStep | DockerBuildTestPublishStep;
  isPrFlow: boolean;
  workflows: Workflow[];
}
function FlowGraphDockerStep({
  namespace,
  flowName,
  step,
  isPrFlow,
  workflows,
}: FlowGraphDockerStepProps) {
  const displayEvent = getDisplayEvent(step);
  const stepDetailsLink = getStepDetailsLink(namespace, flowName, step);

  return (
    <FlowGraphNode
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
      <FlowGraphCommit isPrFlow={isPrFlow} workflow={workflow} />
      <FlowGraphTimestamp node={node} />
      <a
        className={styles.nodeRowLink}
        href={repoLink}
        target="_blank"
        rel="noreferrer"
      >
        <i className={`nf nf-fa-file_text_o ${styles.dockerfileIcon}`} />{" "}
        <span className={styles.nodeText}>Dockerfile</span>
      </a>
    </>
  );
}

function getDisplayEvent(
  step: DockerBuildTestStep | DockerBuildTestPublishStep,
) {
  switch (step.stepSource) {
    case StepSource.DockerBuildTest:
      return "BUILD";
    case StepSource.DockerBuildTestPublish:
      return "PUBLISH";
    default:
      step satisfies never;
      console.log("unknown step");
      console.log(step);
      return "UNKNOWN";
  }
}

export { FlowGraphDockerStep };
