import { assert, describe, it } from "vitest";

import {
  getTitleParts,
  TitlePartTypes,
} from "src/components/commitmessage/getTitleParts.ts";

describe("getTitleParts", () => {
  it("returns a single non-PR part for a plain commit message", () => {
    assert.deepEqual(getTitleParts("fix a bug"), [
      { titlePartText: "fix a bug", titlePartType: TitlePartTypes.regularText },
    ]);
  });

  it("splits a PR number at the end into parts", () => {
    assert.deepEqual(getTitleParts("fix a bug (#53)"), [
      {
        titlePartText: "fix a bug (",
        titlePartType: TitlePartTypes.regularText,
      },
      { titlePartText: "#53", titlePartType: TitlePartTypes.prText },
      { titlePartText: ")", titlePartType: TitlePartTypes.regularText },
    ]);
  });

  it("splits a PR number in the middle into three parts", () => {
    assert.deepEqual(getTitleParts("fix (#53) a bug"), [
      { titlePartText: "fix (", titlePartType: TitlePartTypes.regularText },
      { titlePartText: "#53", titlePartType: TitlePartTypes.prText },
      { titlePartText: ") a bug", titlePartType: TitlePartTypes.regularText },
    ]);
  });

  it("handles a title that starts with a PR number", () => {
    assert.deepEqual(getTitleParts("(#53) fix a bug"), [
      { titlePartText: "(", titlePartType: TitlePartTypes.regularText },
      { titlePartText: "#53", titlePartType: TitlePartTypes.prText },
      {
        titlePartText: ") fix a bug",
        titlePartType: TitlePartTypes.regularText,
      },
    ]);
  });

  it("handles multiple PR numbers in one title", () => {
    assert.deepEqual(getTitleParts("fix (#12) and (#34)"), [
      { titlePartText: "fix (", titlePartType: TitlePartTypes.regularText },
      { titlePartText: "#12", titlePartType: TitlePartTypes.prText },
      { titlePartText: ") and (", titlePartType: TitlePartTypes.regularText },
      { titlePartText: "#34", titlePartType: TitlePartTypes.prText },
      { titlePartText: ")", titlePartType: TitlePartTypes.regularText },
    ]);
  });

  it("does not treat a plain parenthetical as a PR number", () => {
    const parts = getTitleParts("fix (something)");
    assert.deepEqual(parts, [
      {
        titlePartText: "fix (something)",
        titlePartType: TitlePartTypes.regularText,
      },
    ]);
  });

  it("splits a backtick expression at the end into parts", () => {
    assert.deepEqual(getTitleParts("add commit `deadbeef`"), [
      {
        titlePartText: "add commit ",
        titlePartType: TitlePartTypes.regularText,
      },
      { titlePartText: "deadbeef", titlePartType: TitlePartTypes.backtickText },
    ]);
  });

  it("splits a backtick expression in the middle into three parts", () => {
    assert.deepEqual(getTitleParts("fix `deadbeef` bug"), [
      { titlePartText: "fix ", titlePartType: TitlePartTypes.regularText },
      { titlePartText: "deadbeef", titlePartType: TitlePartTypes.backtickText },
      { titlePartText: " bug", titlePartType: TitlePartTypes.regularText },
    ]);
  });

  it("handles a title that starts with a backtick expression", () => {
    assert.deepEqual(getTitleParts("`deadbeef` commit"), [
      { titlePartText: "deadbeef", titlePartType: TitlePartTypes.backtickText },
      { titlePartText: " commit", titlePartType: TitlePartTypes.regularText },
    ]);
  });

  it("handles multiple backtick expressions in one title", () => {
    assert.deepEqual(getTitleParts("fix `dead` and `beef`"), [
      { titlePartText: "fix ", titlePartType: TitlePartTypes.regularText },
      { titlePartText: "dead", titlePartType: TitlePartTypes.backtickText },
      { titlePartText: " and ", titlePartType: TitlePartTypes.regularText },
      { titlePartText: "beef", titlePartType: TitlePartTypes.backtickText },
    ]);
  });

  it("backtick takes precedence over pr numbers", () => {
    assert.deepEqual(getTitleParts("revert `pr (#34)` again"), [
      { titlePartText: "revert ", titlePartType: TitlePartTypes.regularText },
      { titlePartText: "pr (#34)", titlePartType: TitlePartTypes.backtickText },
      { titlePartText: " again", titlePartType: TitlePartTypes.regularText },
    ]);
  });

  it("handles backtick expression with backticks inside", () => {
    assert.deepEqual(getTitleParts("fix `project codename \\`foo\\`` bug"), [
      { titlePartText: "fix ", titlePartType: TitlePartTypes.regularText },
      {
        titlePartText: "project codename `foo`",
        titlePartType: TitlePartTypes.backtickText,
      },
      { titlePartText: " bug", titlePartType: TitlePartTypes.regularText },
    ]);
  });

  it("returns an empty array for an empty string", () => {
    assert.isEmpty(getTitleParts(""));
  });
});
