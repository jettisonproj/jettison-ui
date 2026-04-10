import { assert, describe, it } from "vitest";

import {
  NodeTypes,
} from "src/data/types/workflowTypes.ts";
import { getWorkflowPodName } from "src/components/flow/history/selected/getWorkflowPodName.ts";
import { getTestNode } from "src/utils/testUtil.ts";

describe("getWorkflowPodName", () => {
  it("returns workflowName when it equals the node name", () => {
    const node = getTestNode("my-workflow", NodeTypes.Pod);
    assert.strictEqual(getWorkflowPodName("my-workflow", node), "my-workflow");
  });

  it("returns workflowName for a Container node whose stripped name matches workflowName", () => {
    // Container nodes have a ".<containerName>" postfix stripped before comparison
    const node = getTestNode("my-workflow.main", NodeTypes.Container);
    assert.strictEqual(getWorkflowPodName("my-workflow", node), "my-workflow");
  });

  it("computes prefix and hash for a normal pod node", () => {
    // prefix = "my-workflow-docker-build-test", hash of "my-workflow-step" = 1497189440
    const node = getTestNode("my-workflow-step", NodeTypes.Pod);
    assert.strictEqual(
      getWorkflowPodName("my-workflow", node),
      "my-workflow-docker-build-test-1497189440",
    );
  });

  it("uses the stripped name as the hash input for a Container node", () => {
    // ".main" is stripped → podNodeName = "my-workflow-step", same hash as pod case
    const node = getTestNode("my-workflow-step.main", NodeTypes.Container);
    assert.strictEqual(
      getWorkflowPodName("my-workflow", node),
      "my-workflow-docker-build-test-1497189440",
    );
  });

  it("truncates the prefix when it exceeds the max length", () => {
    // workflowName (240) + "-docker-build-test" (18) = 258 chars > 242 limit
    // truncated prefix = workflowName (240) + "-d" = 242 chars
    // hash of "some-node" = 954883824
    const longWorkflowName = "w".repeat(240);
    const node = getTestNode("some-node", NodeTypes.Pod);
    const result = getWorkflowPodName(longWorkflowName, node);
    assert.strictEqual(result, `${"w".repeat(240)}-d-954883824`);
    // Verify result is within the 253-char K8s resource name limit
    assert.isAtMost(result.length, 253);
  });
});
