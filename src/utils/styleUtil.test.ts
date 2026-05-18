import { assert, describe, it } from "vitest";

import { concatOptionalStyle } from "src/utils/styleUtil.ts";

describe("concatStyles", () => {
  it("concatenates classes", () => {
    assert.strictEqual(concatOptionalStyle("base", "extra"), "base extra");
  });

  it("handled optional class", () => {
    assert.strictEqual(concatOptionalStyle("base", undefined), "base");
  });
});
