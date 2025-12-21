import { TemplateName } from "src/data/types/workflowTypes.ts";
import { ArgoCDNode } from "src/components/flow/history/selected/nodes/ArgoCDNode.tsx";
import { GitHubCheckStartNode } from "src/components/flow/history/selected/nodes/GitHubCheckStartNode.tsx";
import { DockerBuildTestNode } from "src/components/flow/history/selected/nodes/DockerBuildTestNode.tsx";
import { DockerBuildTestPublishNode } from "src/components/flow/history/selected/nodes/DockerBuildTestPublishNode.tsx";
import type { WorkflowGraphNodeProps } from "src/components/flow/history/selected/nodes/WorkflowGraphNodeBase.ts";

function WorkflowGraphNode({ node, workflowBaseUrl }: WorkflowGraphNodeProps) {
  const { template } = node.templateRef;
  switch (template) {
    case TemplateName.GitHubCheckStart:
      return (
        <GitHubCheckStartNode node={node} workflowBaseUrl={workflowBaseUrl} />
      );
    case TemplateName.DockerBuildTest:
      return (
        <DockerBuildTestNode node={node} workflowBaseUrl={workflowBaseUrl} />
      );
    case TemplateName.DockerBuildTestPublish:
      return (
        <DockerBuildTestPublishNode
          node={node}
          workflowBaseUrl={workflowBaseUrl}
        />
      );
    case TemplateName.ArgoCD:
      return <ArgoCDNode node={node} workflowBaseUrl={workflowBaseUrl} />;
    case TemplateName.GitHubCheckComplete:
      throw new WorkflowGraphNodeError(
        `invalid template to render: ${TemplateName.GitHubCheckComplete}`,
      );
    default:
      template satisfies never;
      console.log("invalid template name");
      console.log(template);
      throw new WorkflowGraphNodeError("invalid template name");
  }
}

class WorkflowGraphNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { WorkflowGraphNode };
