import { assert, describe, it } from "vitest";

import {
  getTriggerDisplayName,
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
