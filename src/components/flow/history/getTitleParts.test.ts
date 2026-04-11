import { assert, describe, it } from "vitest";

import { getTitleParts } from "src/components/flow/history/getTitleParts.ts";

describe("getTitleParts", () => {
  it("returns a single non-PR part for a plain commit message", () => {
    assert.deepEqual(getTitleParts("fix a bug"), [
      { titlePart: "fix a bug", isPrNumber: false },
    ]);
  });

  it("splits a PR number at the end into parts", () => {
    assert.deepEqual(getTitleParts("fix a bug (#53)"), [
      { titlePart: "fix a bug (", isPrNumber: false },
      { titlePart: "#53", isPrNumber: true },
      { titlePart: ")", isPrNumber: false },
    ]);
  });

  it("splits a PR number in the middle into three parts", () => {
    assert.deepEqual(getTitleParts("fix (#53) a bug"), [
      { titlePart: "fix (", isPrNumber: false },
      { titlePart: "#53", isPrNumber: true },
      { titlePart: ") a bug", isPrNumber: false },
    ]);
  });

  it("handles a title that starts with a PR number", () => {
    assert.deepEqual(getTitleParts("(#53) fix a bug"), [
      { titlePart: "(", isPrNumber: false },
      { titlePart: "#53", isPrNumber: true },
      { titlePart: ") fix a bug", isPrNumber: false },
    ]);
  });

  it("handles multiple PR numbers in one title", () => {
    assert.deepEqual(getTitleParts("fix (#12) and (#34)"), [
      { titlePart: "fix (", isPrNumber: false },
      { titlePart: "#12", isPrNumber: true },
      { titlePart: ") and (", isPrNumber: false },
      { titlePart: "#34", isPrNumber: true },
      { titlePart: ")", isPrNumber: false },
    ]);
  });

  it("does not treat a plain parenthetical as a PR number", () => {
    const parts = getTitleParts("fix (something)");
    assert.deepEqual(parts, [
      { titlePart: "fix (something)", isPrNumber: false },
    ]);
  });

  it("returns an empty array for an empty string", () => {
    assert.isEmpty(getTitleParts(""));
  });
});
