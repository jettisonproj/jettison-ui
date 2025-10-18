import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";
import { TemplateName } from "src/data/types/workflowTypes.ts";
import { ArgoCDNode } from "src/components/flow/history/workflow/nodes/ArgoCDNode.tsx";
import { GitHubCheckStartNode } from "src/components/flow/history/workflow/nodes/GitHubCheckStartNode.tsx";
import { DockerBuildTestNode } from "src/components/flow/history/workflow/nodes/DockerBuildTestNode.tsx";
import { DockerBuildTestPublishNode } from "src/components/flow/history/workflow/nodes/DockerBuildTestPublishNode.tsx";

interface WorkflowGraphTemplateNodeProps {
  node: WorkflowStatusNode;
}
function WorkflowGraphTemplateNode({ node }: WorkflowGraphTemplateNodeProps) {
  const { template } = node.templateRef;
  switch (template) {
    case TemplateName.GitHubCheckStart:
      return <GitHubCheckStartNode />;
    case TemplateName.DockerBuildTest:
      return <DockerBuildTestNode />;
    case TemplateName.DockerBuildTestPublish:
      return <DockerBuildTestPublishNode />;
    case TemplateName.ArgoCD:
      return <ArgoCDNode />;
    case TemplateName.GitHubCheckComplete:
      throw new WorkflowGraphTemplateNodeError(
        "invalid template to render: GitHubCheckComplete",
      );
    default:
      template satisfies never;
      console.log("invalid template name");
      console.log(template);
      throw new WorkflowGraphTemplateNodeError("invalid template name");
  }
}

class WorkflowGraphTemplateNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { WorkflowGraphTemplateNode };
