import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import type { WorkflowPendingGraphNodeProps } from "src/components/flow/history/selected/nodes/WorkflowGraphNodeBase.ts";
import { flowDefaultStepName } from "src/data/data.ts";
import { StepSources } from "src/data/types/flowTypes.ts";
import {
  BUILD_DISPLAY_NAME,
  PUBLISH_DISPLAY_NAME,
} from "src/utils/flowUtil.ts";
import { getDisplayRepoPath } from "src/utils/gitUtil.ts";

function WorkflowPendingGraphNode({
  nodePendingCreation,
  workflowBaseUrl,
  isSelected,
}: WorkflowPendingGraphNodeProps) {
  const className = isSelected
    ? styles.nodeRowHeaderSelected
    : styles.nodeRowHeaderOnly;
  switch (nodePendingCreation.stepSource) {
    case StepSources.DockerBuildTest: {
      return (
        <FlowGraphNode
          headerClass={className}
          headerLink={`${workflowBaseUrl}?node=${flowDefaultStepName(nodePendingCreation)}`}
          titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
          titleText={BUILD_DISPLAY_NAME}
        />
      );
    }
    case StepSources.DockerBuildTestPublish: {
      return (
        <FlowGraphNode
          headerClass={className}
          headerLink={`${workflowBaseUrl}?node=${flowDefaultStepName(nodePendingCreation)}`}
          titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
          titleText={PUBLISH_DISPLAY_NAME}
        />
      );
    }
    case StepSources.ArgoCD: {
      const { repoPath } = nodePendingCreation;
      return (
        <FlowGraphNode
          headerClass={className}
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
