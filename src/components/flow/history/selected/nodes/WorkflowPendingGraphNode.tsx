import { StepSource } from "src/data/types/flowTypes.ts";
import { flowDefaultStepName } from "src/data/data.ts";
import type { WorkflowPendingGraphNodeProps } from "src/components/flow/history/selected/nodes/WorkflowGraphNodeBase.ts";
import { getWorkflowGraphNodeClass } from "src/components/flow/history/selected/nodes/WorkflowGraphNodeBase.ts";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import {
  BUILD_DISPLAY_NAME,
  PUBLISH_DISPLAY_NAME,
} from "src/utils/flowUtil.ts";
import { getDisplayRepoPath } from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";

function WorkflowPendingGraphNode({
  nodePendingCreation,
  workflowBaseUrl,
  isSelected,
}: WorkflowPendingGraphNodeProps) {
  const className = getWorkflowGraphNodeClass(isSelected);
  switch (nodePendingCreation.stepSource) {
    case StepSource.DockerBuildTest: {
      return (
        <FlowGraphNode
          className={className}
          headerLink={`${workflowBaseUrl}?node=${flowDefaultStepName(nodePendingCreation)}`}
          titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
          titleText={BUILD_DISPLAY_NAME}
        />
      );
    }
    case StepSource.DockerBuildTestPublish: {
      return (
        <FlowGraphNode
          className={className}
          headerLink={`${workflowBaseUrl}?node=${flowDefaultStepName(nodePendingCreation)}`}
          titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
          titleText={PUBLISH_DISPLAY_NAME}
        />
      );
    }
    case StepSource.ArgoCD: {
      const { repoPath } = nodePendingCreation;
      return (
        <FlowGraphNode
          className={className}
          headerLink={`${workflowBaseUrl}?node=${flowDefaultStepName(nodePendingCreation)}`}
          titleIcon={`nf nf-md-kubernetes ${styles.k8sIcon}`}
          titleText={getDisplayRepoPath(repoPath, repoPath)}
        />
      );
    }
    default: {
      nodePendingCreation satisfies never;
      console.log("invalid flow step for pending node");
      console.log(nodePendingCreation);
      throw new WorkflowPendingGraphNodeError("invalid flow step");
    }
  }
}

class WorkflowPendingGraphNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { WorkflowPendingGraphNode };
