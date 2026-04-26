import { assert, describe, it } from "vitest";

import type { Step } from "src/data/types/flowTypes.ts";
import { StepSources } from "src/data/types/flowTypes.ts";
import type { NodeType } from "src/data/types/workflowTypes.ts";
import {
  NodePhases,
  NodeTypes,
  WorkflowPhases,
} from "src/data/types/workflowTypes.ts";
import { PR_DISPLAY_NAME, PUSH_DISPLAY_NAME } from "src/utils/flowUtil.ts";
import { getTestNode, getTestWorkflow } from "src/utils/testUtil.ts";
import {
  EXIT_NODE_SUFFIX,
  getLastWorkflowNodeForStep,
  getLastWorkflowNodeForTrigger,
  getMemoResourcePath,
  getMemoTriggerDisplayName,
  getNodeDockerfilePath,
  getNodeResourcePath,
  getNodeTriggerDisplayName,
  getNumActiveWorkflows,
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionNumber,
  getWorkflowRevisionRef,
  getWorkflowRevisionTitle,
  InvalidNodeError,
  isMemoizedNode,
  isWorkflowGraphNode,
  TRIGGER_NODE_NAME,
} from "src/utils/workflowUtil.ts";

describe("isMemoizedNode", () => {
  it("returns true for Pod", () => {
    assert.isTrue(isMemoizedNode(NodeTypes.Pod));
  });

  it("returns true for Skipped", () => {
    assert.isTrue(isMemoizedNode(NodeTypes.Skipped));
  });

  it("returns false for Container", () => {
    assert.isFalse(isMemoizedNode(NodeTypes.Container));
  });

  it("returns false for DAG", () => {
    assert.isFalse(isMemoizedNode(NodeTypes.DAG));
  });

  it("throws for an unknown node type", () => {
    assert.throws(
      () => isMemoizedNode("Unknown" as NodeType),
      InvalidNodeError,
      "unexpected node type in workflow",
    );
  });
});

describe("isWorkflowGraphNode", () => {
  it("returns true for a Pod node without the exit suffix", () => {
    const testNode = getTestNode({
      displayName: "build-step",
      type: NodeTypes.Pod,
    });
    assert.isTrue(isWorkflowGraphNode(testNode));
  });

  it("returns false for a Pod node with the exit suffix", () => {
    const testNode = getTestNode({
      displayName: `build-step${EXIT_NODE_SUFFIX}`,
      type: NodeTypes.Pod,
    });
    assert.isFalse(isWorkflowGraphNode(testNode));
  });

  it("returns false for a Container node", () => {
    const testNode = getTestNode({
      displayName: "internal-build-step",
      type: NodeTypes.Container,
    });
    assert.isFalse(isWorkflowGraphNode(testNode));
  });

  it("returns false for a DAG node", () => {
    const testNode = getTestNode({
      displayName: "build-step",
      type: NodeTypes.DAG,
    });
    assert.isFalse(isWorkflowGraphNode(testNode));
  });
});

describe("getWorkflowRepo", () => {
  it("returns the repo value from the parameter map", () => {
    assert.strictEqual(
      getWorkflowRepo({ repo: "https://github.com/org/repo" }),
      "https://github.com/org/repo",
    );
  });

  it("throws when repo is missing", () => {
    assert.throws(
      () => getWorkflowRepo({}),
      InvalidNodeError,
      "did not find repo in workflow parameter map",
    );
  });
});

describe("getWorkflowRevision", () => {
  it("returns the revision value from the parameter map", () => {
    assert.strictEqual(getWorkflowRevision({ revision: "abc1234" }), "abc1234");
  });

  it("throws when revision is missing", () => {
    assert.throws(
      () => getWorkflowRevision({}),
      InvalidNodeError,
      "did not find revision in workflow parameter map",
    );
  });
});

describe("getWorkflowRevisionRef", () => {
  it("returns the revision-ref value from the parameter map", () => {
    assert.strictEqual(
      getWorkflowRevisionRef({ "revision-ref": "refs/heads/main" }),
      "refs/heads/main",
    );
  });

  it("throws when revision-ref is missing", () => {
    assert.throws(
      () => getWorkflowRevisionRef({}),
      InvalidNodeError,
      "did not find revision-ref in workflow parameter map",
    );
  });
});

describe("getWorkflowRevisionTitle", () => {
  it("returns the revision-title value from the parameter map", () => {
    assert.strictEqual(
      getWorkflowRevisionTitle({ "revision-title": "fix: bug" }),
      "fix: bug",
    );
  });

  it("throws when revision-title is missing", () => {
    assert.throws(
      () => getWorkflowRevisionTitle({}),
      InvalidNodeError,
      "did not find revision-title in workflow parameter map",
    );
  });
});

describe("getWorkflowRevisionAuthor", () => {
  it("returns the revision-author value from the parameter map", () => {
    assert.strictEqual(
      getWorkflowRevisionAuthor({ "revision-author": "octocat" }),
      "octocat",
    );
  });

  it("throws when revision-author is missing", () => {
    assert.throws(
      () => getWorkflowRevisionAuthor({}),
      InvalidNodeError,
      "did not find revision-author in workflow parameter map",
    );
  });
});

describe("getWorkflowRevisionNumber", () => {
  it("returns the revision-number value from the parameter map", () => {
    assert.strictEqual(
      getWorkflowRevisionNumber({ "revision-number": "42" }),
      "42",
    );
  });

  it("throws when revision-number is missing", () => {
    assert.throws(
      () => getWorkflowRevisionNumber({}),
      InvalidNodeError,
      "did not find revision-number in workflow parameter map",
    );
  });
});

describe("getNodeDockerfilePath", () => {
  it("returns the dockerfile-path value from the parameter map", () => {
    assert.strictEqual(
      getNodeDockerfilePath({ "dockerfile-path": "app/Dockerfile" }),
      "app/Dockerfile",
    );
  });

  it("throws when dockerfile-path is missing", () => {
    assert.throws(
      () => getNodeDockerfilePath({}),
      InvalidNodeError,
      "did not find dockerfile-path in workflow parameter map",
    );
  });
});

describe("getMemoResourcePath", () => {
  it("returns the resource-path value from the parameter map", () => {
    assert.strictEqual(
      getMemoResourcePath({ "resource-path": "/deploy/app" }),
      "/deploy/app",
    );
  });

  it("throws when resource-path is missing", () => {
    assert.throws(
      () => getMemoResourcePath({}),
      InvalidNodeError,
      "did not find resource-path in workflow parameter map",
    );
  });
});

describe("getMemoTriggerDisplayName", () => {
  it("returns PR display name for PR event type", () => {
    assert.strictEqual(
      getMemoTriggerDisplayName({ "event-type": "PR" }),
      PR_DISPLAY_NAME,
    );
  });

  it("returns PUSH display name for commit event type", () => {
    assert.strictEqual(
      getMemoTriggerDisplayName({ "event-type": "commit" }),
      PUSH_DISPLAY_NAME,
    );
  });

  it("throws for an unknown event type", () => {
    assert.throws(
      () => getMemoTriggerDisplayName({ "event-type": "unknown" }),
      InvalidNodeError,
      "invalid event type for node: unknown",
    );
  });

  it("throws when event-type is missing", () => {
    assert.throws(
      () => getMemoTriggerDisplayName({}),
      InvalidNodeError,
      "did not find event-type in workflow parameter map",
    );
  });
});

describe("getNodeResourcePath", () => {
  it("returns the resource-path value from the parameter array", () => {
    assert.strictEqual(
      getNodeResourcePath([{ name: "resource-path", value: "/deploy/app" }]),
      "/deploy/app",
    );
  });

  it("throws when the parameter is missing from the array", () => {
    assert.throws(
      () => getNodeResourcePath([]),
      InvalidNodeError,
      "did not find resource-path in parameter array",
    );
  });

  it("throws when the parameter array is undefined", () => {
    assert.throws(
      () => getNodeResourcePath(undefined),
      InvalidNodeError,
      "did not find resource-path in parameter array",
    );
  });
});

describe("getNodeTriggerDisplayName", () => {
  it("returns PR display name for PR event type", () => {
    assert.strictEqual(
      getNodeTriggerDisplayName([{ name: "event-type", value: "PR" }]),
      PR_DISPLAY_NAME,
    );
  });

  it("returns PUSH display name for commit event type", () => {
    assert.strictEqual(
      getNodeTriggerDisplayName([{ name: "event-type", value: "commit" }]),
      PUSH_DISPLAY_NAME,
    );
  });

  it("throws for an unknown event type", () => {
    assert.throws(
      () =>
        getNodeTriggerDisplayName([{ name: "event-type", value: "unknown" }]),
      InvalidNodeError,
      "invalid event type for node: unknown",
    );
  });

  it("throws when the parameter array is undefined", () => {
    assert.throws(
      () => getNodeTriggerDisplayName(undefined),
      InvalidNodeError,
      "did not find event-type in parameter array",
    );
  });
});

describe("getLastWorkflowNodeForTrigger", () => {
  it("returns null for an empty workflow list", () => {
    assert.isNull(getLastWorkflowNodeForTrigger([]));
  });

  it("returns null when the trigger node is not present in any workflow", () => {
    const testWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: "DockerBuildTest",
        },
      ],
    });
    assert.isNull(getLastWorkflowNodeForTrigger([testWorkflow]));
  });

  it("returns the workflow and node when the trigger node exists", () => {
    const testWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: TRIGGER_NODE_NAME,
        },
      ],
    });
    const testNode = testWorkflow.memo.nodes[TRIGGER_NODE_NAME];
    const result = getLastWorkflowNodeForTrigger([testWorkflow]);

    assert.isNotNull(result);
    assert.strictEqual(result.workflow, testWorkflow);

    assert.isNotNull(testNode);
    assert.strictEqual(result.node, testNode);
  });
});

describe("getLastWorkflowNodeForStep", () => {
  it("returns null for an empty workflow list", () => {
    const step: Step = {
      stepSource: StepSources.DockerBuildTest,
    };
    assert.isNull(getLastWorkflowNodeForStep(step, []));
  });

  it("returns null when no matching node", () => {
    const step: Step = {
      stepSource: StepSources.DockerBuildTest,
    };
    const testWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: "no-match-name",
        },
      ],
    });
    assert.isNull(getLastWorkflowNodeForStep(step, [testWorkflow]));
  });

  it("returns null when the node phase is Skipped", () => {
    const step: Step = {
      stepSource: StepSources.DockerBuildTest,
    };
    const testWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: "DockerBuildTest",
          phase: NodePhases.Skipped,
        },
      ],
    });
    assert.isNull(getLastWorkflowNodeForStep(step, [testWorkflow]));
  });

  it("returns null when the node phase is Omitted", () => {
    const step: Step = {
      stepSource: StepSources.DockerBuildTest,
    };
    const testWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: "DockerBuildTest",
          phase: NodePhases.Omitted,
        },
      ],
    });
    assert.isNull(getLastWorkflowNodeForStep(step, [testWorkflow]));
  });

  it("returns null when docker-build-pr-status output is Skipped", () => {
    const step: Step = {
      stepSource: StepSources.DockerBuildTest,
    };
    const testWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: "DockerBuildTest",
          phase: NodePhases.Succeeded,
          outputs: {
            parameters: [
              {
                name: "docker-build-pr-status",
                value: "Skipped",
              },
            ],
          },
        },
      ],
    });
    assert.isNull(getLastWorkflowNodeForStep(step, [testWorkflow]));
  });

  it("returns null when docker-build-commit-status output is Skipped", () => {
    const step: Step = {
      stepSource: StepSources.DockerBuildTest,
    };
    const testWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: "DockerBuildTest",
          phase: NodePhases.Succeeded,
          outputs: {
            parameters: [
              {
                name: "docker-build-commit-status",
                value: "Skipped",
              },
            ],
          },
        },
      ],
    });
    assert.isNull(getLastWorkflowNodeForStep(step, [testWorkflow]));
  });

  it("looks up by stepSource by default", () => {
    const step: Step = {
      stepSource: StepSources.DockerBuildTest,
    };
    const testWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: "DockerBuildTest",
          phase: NodePhases.Succeeded,
        },
      ],
    });
    const testNode = testWorkflow.memo.nodes.DockerBuildTest;

    const result = getLastWorkflowNodeForStep(step, [testWorkflow]);
    assert.isNotNull(result);
    assert.strictEqual(result.workflow, testWorkflow);

    assert.isNotNull(testNode);
    assert.strictEqual(result.node, testNode);
  });

  it("looks up by stepName if provided", () => {
    const step: Step = {
      stepSource: StepSources.DockerBuildTest,
      stepName: "custom-build-test",
    };
    const testWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: "custom-build-test",
          phase: NodePhases.Succeeded,
        },
      ],
    });
    const testNode = testWorkflow.memo.nodes["custom-build-test"];

    const result = getLastWorkflowNodeForStep(step, [testWorkflow]);
    assert.isNotNull(result);
    assert.strictEqual(result.workflow, testWorkflow);

    assert.isNotNull(testNode);
    assert.strictEqual(result.node, testNode);
  });

  it("returns the first non-skipped match across multiple workflows", () => {
    const step: Step = {
      stepSource: StepSources.DockerBuildTest,
    };
    const skippedWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: "DockerBuildTest",
          phase: NodePhases.Skipped,
        },
      ],
    });
    const validWorkflow = getTestWorkflow({
      workflowNodes: [
        {
          displayName: "DockerBuildTest",
          phase: NodePhases.Succeeded,
        },
      ],
    });
    const validNode = validWorkflow.memo.nodes.DockerBuildTest;
    const result = getLastWorkflowNodeForStep(step, [
      skippedWorkflow,
      validWorkflow,
    ]);
    assert.isNotNull(result);
    assert.strictEqual(result.workflow, validWorkflow);

    assert.isNotNull(validNode);
    assert.strictEqual(result.node, validNode);
  });
});

describe("getNumActiveWorkflows", () => {
  it("loading workflows are not counted", () => {
    assert.strictEqual(getNumActiveWorkflows(undefined), 0);
  });

  it("empty workflows are not counted", () => {
    const testWorkflows = new Map();
    assert.strictEqual(getNumActiveWorkflows(testWorkflows), 0);
  });

  it("pending workflows are counted", () => {
    const testWorkflow = getTestWorkflow({
      workflowPhase: WorkflowPhases.Pending,
    });

    const testWorkflows = new Map();
    testWorkflows.set(testWorkflow.metadata.name, testWorkflow);

    assert.strictEqual(getNumActiveWorkflows(testWorkflows), 1);
  });

  it("running workflows are counted", () => {
    const testWorkflow = getTestWorkflow({
      workflowPhase: WorkflowPhases.Running,
    });

    const testWorkflows = new Map();
    testWorkflows.set(testWorkflow.metadata.name, testWorkflow);

    assert.strictEqual(getNumActiveWorkflows(testWorkflows), 1);
  });

  it("unknown workflows are counted", () => {
    const testWorkflow = getTestWorkflow({
      workflowPhase: WorkflowPhases.Unknown,
    });

    const testWorkflows = new Map();
    testWorkflows.set(testWorkflow.metadata.name, testWorkflow);

    assert.strictEqual(getNumActiveWorkflows(testWorkflows), 1);
  });

  it("counted when workflow phase is missing", () => {
    const testWorkflow = getTestWorkflow({});
    const testWorkflows = new Map();
    testWorkflows.set(testWorkflow.metadata.name, testWorkflow);

    assert.strictEqual(getNumActiveWorkflows(testWorkflows), 1);
  });

  it("succeeded workflow are not counted", () => {
    const testWorkflow = getTestWorkflow({
      workflowPhase: WorkflowPhases.Succeeded,
    });

    const testWorkflows = new Map();
    testWorkflows.set(testWorkflow.metadata.name, testWorkflow);

    assert.strictEqual(getNumActiveWorkflows(testWorkflows), 0);
  });
});
