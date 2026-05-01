import { assert, describe, it } from "vitest";

import { StepSources, TriggerSources } from "src/data/types/flowTypes.ts";
import {
  FlowUtilError,
  getFlowTrigger,
  getPushPrWorkflows,
  getStepDetailsLink,
  getTriggerDetailsLink,
  getTriggerDisplayName,
  isPullRequestTrigger,
  PR_DISPLAY_NAME,
  PUSH_DISPLAY_NAME,
} from "src/utils/flowUtil.ts";
import { getTestFlow, getTestWorkflow } from "src/utils/testUtil.ts";

describe("getTriggerDisplayName", () => {
  it("returns PR display name for PR flows", () => {
    assert.strictEqual(getTriggerDisplayName(true), PR_DISPLAY_NAME);
  });

  it("returns PUSH display name for push flows", () => {
    assert.strictEqual(getTriggerDisplayName(false), PUSH_DISPLAY_NAME);
  });
});

describe("getTriggerDetailsLink", () => {
  it("builds a PR flow link using the trigger name", () => {
    const trigger = {
      triggerSource: TriggerSources.GitHubPush,
      repoUrl: "https://github.com/org/repo",
      triggerName: "my-trigger",
    };
    assert.strictEqual(
      getTriggerDetailsLink("org", "repo", true, trigger),
      "/flows/org/repo/pr/my-trigger",
    );
  });

  it("builds a push flow link using the trigger name", () => {
    const trigger = {
      triggerSource: TriggerSources.GitHubPush,
      repoUrl: "https://github.com/org/repo",
      triggerName: "my-trigger",
    };
    assert.strictEqual(
      getTriggerDetailsLink("org", "repo", false, trigger),
      "/flows/org/repo/push/my-trigger",
    );
  });

  it("falls back to triggerSource when triggerName is not set", () => {
    const trigger = {
      triggerSource: TriggerSources.GitHubPush,
      repoUrl: "https://github.com/org/repo",
    };
    assert.strictEqual(
      getTriggerDetailsLink("org", "repo", false, trigger),
      "/flows/org/repo/push/GitHubPush",
    );
  });
});

describe("getStepDetailsLink", () => {
  it("builds a PR flow link using the step name", () => {
    const step = { stepSource: StepSources.DockerBuildTest, stepName: "build" };
    assert.strictEqual(
      getStepDetailsLink("org", "repo", true, step),
      "/flows/org/repo/pr/build",
    );
  });

  it("builds a push flow link using the step name", () => {
    const step = { stepSource: StepSources.DockerBuildTest, stepName: "build" };
    assert.strictEqual(
      getStepDetailsLink("org", "repo", false, step),
      "/flows/org/repo/push/build",
    );
  });

  it("falls back to stepSource when stepName is not set", () => {
    const step = { stepSource: StepSources.DockerBuildTest };
    assert.strictEqual(
      getStepDetailsLink("org", "repo", false, step),
      "/flows/org/repo/push/DockerBuildTest",
    );
  });
});

describe("getFlowTrigger", () => {
  it("throws when there are no triggers", () => {
    const flow = getTestFlow({});
    assert.throws(
      () => getFlowTrigger(flow),
      FlowUtilError,
      "expected 1 Flow trigger but got: 0",
    );
  });

  it("throws when there are multiple triggers", () => {
    const flow = getTestFlow({
      triggers: [
        {
          triggerSource: TriggerSources.GitHubPush,
          triggerName: "repo1-push",
          repoUrl: "https://github.com/org/repo1",
        },
        {
          triggerSource: TriggerSources.GitHubPush,
          triggerName: "repo2-push",
          repoUrl: "https://github.com/org/repo2",
        },
      ],
    });
    assert.throws(
      () => getFlowTrigger(flow),
      FlowUtilError,
      "expected 1 Flow trigger but got: 2",
    );
  });

  it("returns the single trigger", () => {
    const flow = getTestFlow({
      triggers: [
        {
          triggerSource: TriggerSources.GitHubPush,
          repoUrl: "https://github.com/org/repo",
        },
      ],
    });
    const trigger = getFlowTrigger(flow);
    assert.isNotNull(trigger);
    assert.strictEqual(trigger, flow.spec.triggers[0]);
  });
});

describe("isPullRequestTrigger", () => {
  it("returns false for a push trigger", () => {
    const trigger = {
      triggerSource: TriggerSources.GitHubPush,
      repoUrl: "https://github.com/org/repo",
    };
    assert.isFalse(isPullRequestTrigger(trigger));
  });

  it("returns true for a pull request trigger", () => {
    const trigger = {
      triggerSource: TriggerSources.GitHubPullRequest,
      repoUrl: "https://github.com/org/repo",
    };
    assert.isTrue(isPullRequestTrigger(trigger));
  });
});

describe("getPushPrWorkflows", () => {
  it("returns null if flows are still loading", () => {
    const flows = null;
    const workflows = new Map();

    const [pushWorkflows, prWorkflows] = getPushPrWorkflows(
      flows,
      workflows,
      "repoOrg/repoName",
      "repoOrg",
    );

    assert.isNull(pushWorkflows);
    assert.isNull(prWorkflows);
  });

  it("returns null if workflows are still loading", () => {
    const flows = new Map();
    const workflows = null;

    const [pushWorkflows, prWorkflows] = getPushPrWorkflows(
      flows,
      workflows,
      "repoOrg/repoName",
      "repoOrg",
    );

    assert.isNull(pushWorkflows);
    assert.isNull(prWorkflows);
  });

  it("throws when the flow for the repo is not found", () => {
    const flows = new Map();
    const workflows = new Map();

    assert.throws(
      () => getPushPrWorkflows(flows, workflows, "repoOrg/repoName", "repoOrg"),
      FlowUtilError,
      "Unexpected flow repo when looking up workflows: repoOrg/repoName",
    );
  });

  it("throws when the push flow for the repo is not found", () => {
    const flows = new Map();
    flows.set("repoOrg/repoName", {});

    const workflows = new Map();

    assert.throws(
      () => getPushPrWorkflows(flows, workflows, "repoOrg/repoName", "repoOrg"),
      FlowUtilError,
      "Empty push flow when looking up workflows: repoOrg/repoName",
    );
  });

  it("throws when the pr flow for the repo is not found", () => {
    const flows = new Map();
    flows.set("repoOrg/repoName", {
      pushFlow: getTestFlow({}),
    });

    const workflows = new Map();

    assert.throws(
      () => getPushPrWorkflows(flows, workflows, "repoOrg/repoName", "repoOrg"),
      FlowUtilError,
      "Empty PR flow when looking up workflows: repoOrg/repoName",
    );
  });

  it("returns undefined if workflows are empty", () => {
    const flows = new Map();
    flows.set("repoOrg/repoName", {
      pushFlow: getTestFlow({ flowName: "test-push-flow" }),
      prFlow: getTestFlow({ flowName: "test-pr-flow" }),
    });

    const workflows = new Map();

    const [pushWorkflows, prWorkflows] = getPushPrWorkflows(
      flows,
      workflows,
      "repoOrg/repoName",
      "repoOrg",
    );

    assert.isUndefined(pushWorkflows);
    assert.isUndefined(prWorkflows);
  });

  it("returns the workflows when available", () => {
    const testFlows = new Map();
    testFlows.set("repoOrg/repoName", {
      pushFlow: getTestFlow({ flowName: "test-push-flow" }),
      prFlow: getTestFlow({ flowName: "test-pr-flow" }),
    });

    const testPushWorkflow = getTestWorkflow({
      workflowName: "test-push-workflow",
    });
    const testPrWorkflow = getTestWorkflow({
      workflowName: "test-pr-workflow",
    });

    const testPushWorkflows = new Map();
    testPushWorkflows.set("test-push-workflow", testPushWorkflow);
    const testPrWorkflows = new Map();
    testPrWorkflows.set("test-pr-workflow", testPrWorkflow);

    const testOrgWorkflows = new Map();
    testOrgWorkflows.set("test-push-flow", testPushWorkflows);
    testOrgWorkflows.set("test-pr-flow", testPrWorkflows);

    const testWorkflows = new Map();
    testWorkflows.set("repoOrg", testOrgWorkflows);

    const [pushWorkflows, prWorkflows] = getPushPrWorkflows(
      testFlows,
      testWorkflows,
      "repoOrg/repoName",
      "repoOrg",
    );

    assert.strictEqual(pushWorkflows, testPushWorkflows);
    assert.strictEqual(prWorkflows, testPrWorkflows);
  });
});
