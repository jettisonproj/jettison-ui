import { TemplateName } from "src/data/types/workflowTypes.ts";
import type { WorkflowGraphNodeProps } from "src/components/flow/history/selected/nodes/WorkflowGraphNodeBase.ts";
import { getWorkflowGraphNodeClass } from "src/components/flow/history/selected/nodes/WorkflowGraphNodeBase.ts";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import {
  BUILD_DISPLAY_NAME,
  PUBLISH_DISPLAY_NAME,
} from "src/utils/flowUtil.ts";
import { getDisplayRepoPath } from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import {
  getResourcePath,
  getTriggerDisplayName,
} from "src/utils/workflowUtil.ts";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";

function WorkflowGraphNode({
  node,
  workflowBaseUrl,
  isSelected,
}: WorkflowGraphNodeProps) {
  const { template } = node.templateRef;
  const className = getWorkflowGraphNodeClass(isSelected);
  switch (template) {
    case TemplateName.GitHubCheckStart: {
      const triggerDisplayName = getTriggerDisplayName(node.inputs?.parameters);
      return (
        <FlowGraphNode
          className={className}
          headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
          titleIcon={`nf nf-fa-github ${styles.githubIcon}`}
          titleText={triggerDisplayName}
        />
      );
    }
    case TemplateName.DockerBuildTest: {
      return (
        <FlowGraphNode
          className={className}
          headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
          titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
          titleText={BUILD_DISPLAY_NAME}
        />
      );
    }
    case TemplateName.DockerBuildTestPublish: {
      return (
        <FlowGraphNode
          className={className}
          headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
          titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
          titleText={PUBLISH_DISPLAY_NAME}
        />
      );
    }
    case TemplateName.ArgoCD: {
      const resourcePath = getResourcePath(node.inputs?.parameters);
      return (
        <FlowGraphNode
          className={className}
          headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
          titleIcon={`nf nf-md-kubernetes ${styles.k8sIcon}`}
          titleText={getDisplayRepoPath(resourcePath, resourcePath)}
        />
      );
    }
    case TemplateName.GitHubCheckComplete: {
      throw new WorkflowGraphNodeError(
        `invalid template to render: ${TemplateName.GitHubCheckComplete}`,
      );
    }
    default: {
      template satisfies never;
      console.log("invalid template name");
      console.log(template);
      throw new WorkflowGraphNodeError("invalid template name");
    }
  }
}

class WorkflowGraphNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { WorkflowGraphNode };
