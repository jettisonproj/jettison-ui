import { assert, describe, it } from "vitest";

import { concatStyles, StyleUtilError } from "src/utils/styleUtil.ts";

describe("concatStyles", () => {
  it("concatenates classes", () => {
    assert.strictEqual(concatStyles("base", "extra"), "base extra");
  });

  it("throws when baseClass is undefined", () => {
    assert.throws(
      () => concatStyles(undefined, "extra"),
      StyleUtilError,
      "style class was unexpectedly null",
    );
  });

  it("throws when additionalClass is undefined", () => {
    assert.throws(
      () => concatStyles("base", undefined),
      StyleUtilError,
      "style class was unexpectedly null",
    );
  });
});
