import { assert, describe, it } from "vitest";

import { StepSources, TriggerSources } from "src/data/types/flowTypes.ts";
import {
  FlowUtilError,
  getTriggerDetailsLink,
  getTriggerDisplayName,
  getFlowTrigger,
  getStepDetailsLink,
  isPullRequestTrigger,
  PR_DISPLAY_NAME,
  PUSH_DISPLAY_NAME,
} from "src/utils/flowUtil.ts";
import { getTestFlow } from "src/utils/testUtil.ts";

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
