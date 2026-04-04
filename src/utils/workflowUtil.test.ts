import { assert, describe, it } from "vitest";

import {
  NodePhases,
  NodeTypes,
  TemplateNames,
} from "src/data/types/workflowTypes.ts";
import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";
import { PR_DISPLAY_NAME, PUSH_DISPLAY_NAME } from "src/utils/flowUtil.ts";
import {
  EXIT_NODE_SUFFIX,
  getMemoResourcePath,
  getMemoTriggerDisplayName,
  getNodeDockerfilePath,
  getNodeResourcePath,
  getNodeTriggerDisplayName,
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionNumber,
  getWorkflowRevisionRef,
  getWorkflowRevisionTitle,
  InvalidNodeError,
  isMemoizedNode,
  isWorkflowGraphNode,
} from "src/utils/workflowUtil.ts";

function makeNode(
  type: WorkflowStatusNode["type"],
  displayName: string,
): WorkflowStatusNode {
  return {
    id: "test-id",
    name: "test-name",
    displayName,
    phase: NodePhases.Running,
    type,
    templateRef: { template: TemplateNames.GitHubCheckStart },
    startedAt: "2026-01-01T00:00:00Z",
  };
}

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
      () => isMemoizedNode("Unknown" as WorkflowStatusNode["type"]),
      InvalidNodeError,
      "unexpected node type in workflow",
    );
  });
});

describe("isWorkflowGraphNode", () => {
  it("returns true for a Pod node without the exit suffix", () => {
    assert.isTrue(isWorkflowGraphNode(makeNode(NodeTypes.Pod, "build-step")));
  });

  it("returns false for a Pod node with the exit suffix", () => {
    assert.isFalse(
      isWorkflowGraphNode(
        makeNode(NodeTypes.Pod, `build-step${EXIT_NODE_SUFFIX}`),
      ),
    );
  });

  it("returns false for a Container node", () => {
    assert.isFalse(
      isWorkflowGraphNode(makeNode(NodeTypes.Container, "build-step")),
    );
  });

  it("returns false for a DAG node", () => {
    assert.isFalse(isWorkflowGraphNode(makeNode(NodeTypes.DAG, "build-step")));
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
});

describe("getWorkflowRevisionTitle", () => {
  it("returns the revision-title value from the parameter map", () => {
    assert.strictEqual(
      getWorkflowRevisionTitle({ "revision-title": "fix: bug" }),
      "fix: bug",
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
});

describe("getWorkflowRevisionNumber", () => {
  it("returns the revision-number value from the parameter map", () => {
    assert.strictEqual(
      getWorkflowRevisionNumber({ "revision-number": "42" }),
      "42",
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
});
