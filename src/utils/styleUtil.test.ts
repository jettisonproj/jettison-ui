import { assert, describe, it } from "vitest";

import {
  concatOptionalStyle,
  concatStyles,
  StyleUtilError,
} from "src/utils/styleUtil.ts";

describe("concatStyles", () => {
  it("concatenates classes when addAdditionalClass is true", () => {
    assert.strictEqual(concatStyles("base", "extra", true), "base extra");
  });

  it("returns base class when addAdditionalClass is false", () => {
    assert.strictEqual(concatStyles("base", "extra", false), "base");
  });

  it("throws when baseClass is undefined", () => {
    assert.throws(
      () => concatStyles(undefined, "extra", true),
      StyleUtilError,
      "style class was unexpectedly null",
    );
  });

  it("throws when additionalClass is undefined", () => {
    assert.throws(
      () => concatStyles("base", undefined, true),
      StyleUtilError,
      "style class was unexpectedly null",
    );
  });
});

describe("concatOptionalStyle", () => {
  it("concatenates classes when additionalClass is provided", () => {
    assert.strictEqual(concatOptionalStyle("base", "extra"), "base extra");
  });

  it("returns base class when additionalClass is undefined", () => {
    assert.strictEqual(concatOptionalStyle("base", undefined), "base");
  });

  it("throws when baseClass is undefined", () => {
    assert.throws(
      () => concatOptionalStyle(undefined, "extra"),
      StyleUtilError,
      "base style class was unexpectedly null",
    );
  });
});
