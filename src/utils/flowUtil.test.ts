import { assert, describe, it } from "vitest";

import { StepSources, TriggerSources } from "src/data/types/flowTypes.ts";
import {
  getTriggerDetailsLink,
  getTriggerDisplayName,
  getStepDetailsLink,
  PR_DISPLAY_NAME,
  PUSH_DISPLAY_NAME,
} from "src/utils/flowUtil.ts";

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
