import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";
import {
  NodePhases,
  NodeTypes,
  TemplateNames,
} from "src/data/types/workflowTypes.ts";
import type {
  Workflow,
  WorkflowStatusNode,
} from "src/data/types/workflowTypes.ts";
import type { Flow, Step, Trigger } from "src/data/types/flowTypes.ts";
import { TriggerSources } from "src/data/types/flowTypes.ts";
import { memoizeWorkflow } from "src/providers/resourceEventMemo.ts";

/**
 * Type for creating a test WorkflowStatusNode.
 * All fields optional except displayName
 */
type TestWorkflowStatusNode = Partial<WorkflowStatusNode> &
  Pick<WorkflowStatusNode, "displayName">;

function getTestNode({
  displayName,
  name = displayName,
  id = name,
  phase = NodePhases.Running,
  type = NodeTypes.Pod,
  templateRef = {
    template: TemplateNames.DockerBuildTest,
  },
  startedAt = "2026-01-01T00:00:00Z",
  ...rest
}: TestWorkflowStatusNode): WorkflowStatusNode {
  return {
    id,
    name,
    displayName,
    phase,
    type,
    templateRef,
    startedAt,
    ...rest,
  };
}

interface TestWorkflow {
  workflowName?: string;
  workflowNodes?: TestWorkflowStatusNode[];
}
function getTestWorkflow({
  workflowName = "test-workflow",
  workflowNodes = [],
}: TestWorkflow): Workflow {
  const testWorkflowNodes = workflowNodes.reduce<
    Record<string, WorkflowStatusNode>
  >((acc, workflowNode) => {
    const testWorkflowNode = getTestNode(workflowNode);
    acc[testWorkflowNode.id] = testWorkflowNode;
    return acc;
  }, {});

  const testWorkflow = {
    kind: ResourceKinds.Workflow,
    metadata: {
      namespace: "default",
      name: workflowName,
    },
    spec: { arguments: { parameters: [] } },
    status: {
      nodes: testWorkflowNodes,
    },
    memo: {
      parameterMap: {},
      nodes: {},
      sortedNodes: [],
    },
  };

  memoizeWorkflow(testWorkflow);

  return testWorkflow;
}

interface TestFlow {
  flowName?: string;
  steps?: Step[];
  triggers?: Trigger[];
}
function getTestFlow({
  flowName = "test-flow",
  steps = [],
  triggers = [],
}: TestFlow): Flow {
  return {
    kind: ResourceKinds.Flow,
    metadata: {
      namespace: "default",
      name: flowName,
    },
    spec: { steps, triggers },
    memo: {
      trigger: {
        triggerSource: TriggerSources.GitHubPush,
        repoUrl: "https://github.com/org/repo",
      },
      isPrFlow: false,
    },
  };
}

export { getTestNode, getTestWorkflow, getTestFlow };
