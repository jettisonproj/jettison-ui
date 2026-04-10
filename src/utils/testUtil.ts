import { NodePhases, TemplateNames } from "src/data/types/workflowTypes.ts";
import type {
  NodeType,
  WorkflowStatusNode,
} from "src/data/types/workflowTypes.ts";

function getTestNode(
  displayName: string,
  nodeType: NodeType,
): WorkflowStatusNode {
  return {
    id: "test-id",
    name: displayName,
    displayName,
    phase: NodePhases.Running,
    type: nodeType,
    templateRef: {
      template: TemplateNames.DockerBuildTest,
    },
    startedAt: "2026-01-01T00:00:00Z",
  };
}

export { getTestNode };
