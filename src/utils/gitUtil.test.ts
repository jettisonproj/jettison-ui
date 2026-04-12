import { assert, describe, it } from "vitest";

import {
  appendGitSuffix,
  getDisplayCommit,
  getDisplayRepoPath,
  getRepoAuthorLink,
  getRepoCommitLink,
  getRepoCommitPathLink,
  getRepoLink,
  getRepoOrgAndName,
  getRepoOrgName,
  getRepoPathLink,
  getRepoPrLink,
  getRepoTreeLink,
  GitUtilError,
  sortByRepoName,
  trimBranchPrefix,
  trimGitSuffix,
} from "src/utils/gitUtil.ts";

describe("appendGitSuffix", () => {
  it("appends .git when missing", () => {
    assert.strictEqual(
      appendGitSuffix("https://github.com/org/repo"),
      "https://github.com/org/repo.git",
    );
  });

  it("is idempotent when .git already present", () => {
    assert.strictEqual(
      appendGitSuffix("https://github.com/org/repo.git"),
      "https://github.com/org/repo.git",
    );
  });
});

describe("trimGitSuffix", () => {
  it("removes .git suffix", () => {
    assert.strictEqual(
      trimGitSuffix("https://github.com/org/repo.git"),
      "https://github.com/org/repo",
    );
  });

  it("is idempotent when .git not present", () => {
    assert.strictEqual(
      trimGitSuffix("https://github.com/org/repo"),
      "https://github.com/org/repo",
    );
  });
});

describe("trimBranchPrefix", () => {
  it("removes refs/heads/ prefix", () => {
    assert.strictEqual(trimBranchPrefix("refs/heads/main"), "main");
  });

  it("is idempotent when prefix not present", () => {
    assert.strictEqual(trimBranchPrefix("main"), "main");
  });
});

describe("getDisplayCommit", () => {
  it("returns first 7 characters of a full hash", () => {
    assert.strictEqual(getDisplayCommit("abc1234567890def"), "abc1234");
  });

  it("returns the full string when shorter than 7 characters", () => {
    assert.strictEqual(getDisplayCommit("abc"), "abc");
  });
});

describe("getRepoTreeLink", () => {
  it("builds tree link with explicit baseRef", () => {
    assert.strictEqual(
      getRepoTreeLink("https://github.com/org/repo.git", "develop"),
      "https://github.com/org/repo/tree/develop",
    );
  });

  it("uses default baseRef (main) when undefined", () => {
    assert.strictEqual(
      getRepoTreeLink("https://github.com/org/repo.git", undefined),
      "https://github.com/org/repo/tree/main",
    );
  });

  it("trims .git suffix from the URL", () => {
    assert.strictEqual(
      getRepoTreeLink("https://github.com/org/repo.git", "main"),
      "https://github.com/org/repo/tree/main",
    );
  });
});

describe("getRepoPathLink", () => {
  it("appends path to the tree link", () => {
    assert.strictEqual(
      getRepoPathLink(
        "https://github.com/org/repo.git",
        "main",
        "src/index.ts",
      ),
      "https://github.com/org/repo/tree/main/src/index.ts",
    );
  });
});

describe("getRepoAuthorLink", () => {
  it("filters commits with branch and author", () => {
    assert.strictEqual(
      getRepoAuthorLink("https://github.com/org/repo.git", "main", "user"),
      "https://github.com/org/repo/commits/main?author=user",
    );
  });
});

describe("getRepoCommitLink", () => {
  it("builds commit link and trims .git suffix", () => {
    assert.strictEqual(
      getRepoCommitLink("https://github.com/org/repo.git", "abc1234"),
      "https://github.com/org/repo/commit/abc1234",
    );
  });
});

describe("getRepoCommitPathLink", () => {
  it("builds blob link for a path at a commit", () => {
    assert.strictEqual(
      getRepoCommitPathLink(
        "https://github.com/org/repo.git",
        "abc1234",
        "src/index.ts",
      ),
      "https://github.com/org/repo/blob/abc1234/src/index.ts",
    );
  });
});

describe("getRepoPrLink", () => {
  it("builds pull request link and trims .git suffix", () => {
    assert.strictEqual(
      getRepoPrLink("https://github.com/org/repo.git", "42"),
      "https://github.com/org/repo/pull/42",
    );
  });
});

describe("getRepoOrgName", () => {
  it("strips GitHub prefix and .git suffix", () => {
    assert.strictEqual(
      getRepoOrgName("https://github.com/org/repo.git"),
      "org/repo",
    );
  });

  it("is idempotent on already-processed org/name", () => {
    assert.strictEqual(getRepoOrgName("org/repo"), "org/repo");
  });
});

describe("getRepoOrgAndName", () => {
  it("splits a valid org/name string", () => {
    assert.deepEqual(getRepoOrgAndName("org/repo"), ["org", "repo"]);
  });

  it("throws on a string with no slash", () => {
    assert.throws(
      () => getRepoOrgAndName("invalid"),
      GitUtilError,
      "invalid repoOrgName: invalid",
    );
  });

  it("throws on a string with more than one slash", () => {
    assert.throws(
      () => getRepoOrgAndName("a/b/c"),
      GitUtilError,
      "invalid repoOrgName: a/b/c",
    );
  });
});

describe("getRepoLink", () => {
  it("builds a GitHub URL from org and name", () => {
    assert.strictEqual(
      getRepoLink("org", "repo"),
      "https://github.com/org/repo",
    );
  });
});

describe("getDisplayRepoPath", () => {
  it("returns the last path component", () => {
    assert.strictEqual(
      getDisplayRepoPath("https://github.com/org/repo", "default"),
      "repo",
    );
  });

  it("strips .git suffix from the last path component", () => {
    assert.strictEqual(
      getDisplayRepoPath("https://github.com/org/repo.git", "default"),
      "repo",
    );
  });

  it("skips trailing slashes to find the last component", () => {
    assert.strictEqual(
      getDisplayRepoPath("https://github.com/org/repo/", "default"),
      "repo",
    );
  });

  it("returns the defaultValue when the pathname has no meaningful component", () => {
    assert.strictEqual(getDisplayRepoPath("", "default"), "default");
  });
});

describe("sortByRepoName", () => {
  it("sorts repos alphabetically by name", () => {
    const repos = ["org/zebra", "org/apple", "org/mango"];
    assert.deepEqual(repos.sort(sortByRepoName), [
      "org/apple",
      "org/mango",
      "org/zebra",
    ]);
  });

  it("returns 0 for repos with the same name", () => {
    assert.strictEqual(sortByRepoName("org1/repo", "org2/repo"), 0);
  });
});
