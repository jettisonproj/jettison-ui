import { flowDefaults } from "src/data/data.ts";

const COMMIT_DISPLAY_LEN = 7;
const GIT_SUFFIX = ".git";

function appendGitSuffix(s: string) {
  if (s.endsWith(GIT_SUFFIX)) {
    return s;
  }
  return `${s}${GIT_SUFFIX}`;
}

function trimGitSuffix(s: string) {
  if (s.endsWith(GIT_SUFFIX)) {
    return s.slice(0, -1 * GIT_SUFFIX.length);
  }
  return s;
}

function getDisplayCommit(commit: string) {
  return commit.slice(0, COMMIT_DISPLAY_LEN);
}

/**
 * Get the link url to the root of the repo and baseRef
 */
function getRepoTreeLink(repoUrl: string, baseRef: string | undefined) {
  repoUrl = trimGitSuffix(repoUrl);
  baseRef = baseRef ?? flowDefaults.baseRef;
  return `${repoUrl}/tree/${baseRef}`;
}

/**
 * Get the link url to the path using the repo and baseRef
 */
function getRepoPathLink(
  repoUrl: string,
  baseRef: string | undefined,
  path: string,
) {
  const repoTreeLink = getRepoTreeLink(repoUrl, baseRef);
  return `${repoTreeLink}/${path}`;
}

/**
 * Get the link url to the commit in the repo
 */
function getRepoCommitLink(repoUrl: string, commit: string) {
  repoUrl = trimGitSuffix(repoUrl);
  return `${repoUrl}/commit/${commit}`;
}

/**
 * Get the link url to the PR in the repo
 */
function getRepoPrLink(repoUrl: string, prNumber: string) {
  repoUrl = trimGitSuffix(repoUrl);
  return `${repoUrl}/pull/${prNumber}`;
}

export {
  appendGitSuffix,
  trimGitSuffix,
  getDisplayCommit,
  getRepoTreeLink,
  getRepoPathLink,
  getRepoCommitLink,
  getRepoPrLink,
};
