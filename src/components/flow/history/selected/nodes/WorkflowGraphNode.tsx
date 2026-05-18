import type { JSX } from "react";

import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import type { WorkflowGraphNodeProps } from "src/components/flow/history/selected/nodes/WorkflowGraphNodeBase.ts";
import { TemplateNames } from "src/data/types/workflowTypes.ts";
import {
  BUILD_DISPLAY_NAME,
  PUBLISH_DISPLAY_NAME,
} from "src/utils/flowUtil.ts";
import { getDisplayRepoPath } from "src/utils/gitUtil.ts";
import {
  getNodeResourcePath,
  getNodeTriggerDisplayName,
} from "src/utils/workflowUtil.ts";

function WorkflowGraphNode({
  node,
  workflowBaseUrl,
  isSelected,
}: WorkflowGraphNodeProps): JSX.Element {
  const { template } = node.memo;
  const className = isSelected
    ? styles.nodeRowHeaderSelected
    : styles.nodeRowHeaderOnly;
  switch (template) {
    case TemplateNames.GitHubCheckStart: {
      const triggerDisplayName = getNodeTriggerDisplayName(
        node.inputs?.parameters,
      );
      return (
        <FlowGraphNode
          headerClass={className}
          headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
          titleIcon={`nf nf-fa-github ${styles.githubIcon}`}
          titleText={triggerDisplayName}
        />
      );
    }
    case TemplateNames.DockerBuildTest: {
      return (
        <FlowGraphNode
          headerClass={className}
          headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
          titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
          titleText={BUILD_DISPLAY_NAME}
        />
      );
    }
    case TemplateNames.DockerBuildTestPublish: {
      return (
        <FlowGraphNode
          headerClass={className}
          headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
          titleIcon={`nf nf-fa-docker ${styles.dockerIcon}`}
          titleText={PUBLISH_DISPLAY_NAME}
        />
      );
    }
    case TemplateNames.ArgoCD: {
      const resourcePath = getNodeResourcePath(node.inputs?.parameters);
      return (
        <FlowGraphNode
          headerClass={className}
          headerLink={`${workflowBaseUrl}?node=${node.displayName}`}
          titleIcon={`nf nf-md-kubernetes ${styles.k8sIcon}`}
          titleText={getDisplayRepoPath(resourcePath, resourcePath)}
        />
      );
    }
    case TemplateNames.GitHubCheckComplete: {
      throw new WorkflowGraphNodeError(
        `invalid template to render: ${TemplateNames.GitHubCheckComplete}`,
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
