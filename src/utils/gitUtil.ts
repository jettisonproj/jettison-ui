import { flowDefaults } from "src/data/data.ts";

const COMMIT_DISPLAY_LEN = 7;
const BRANCH_PREFIX = "refs/heads/";
const GIT_SUFFIX = ".git";
const GIT_PREFIX = "https://github.com/";

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

function trimGitPrefix(s: string) {
  if (s.startsWith(GIT_PREFIX)) {
    return s.slice(GIT_PREFIX.length);
  }
  return s;
}

function trimBranchPrefix(branch: string) {
  if (branch.startsWith(BRANCH_PREFIX)) {
    return branch.slice(BRANCH_PREFIX.length);
  }
  return branch;
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

/*
 * Get the link to the path using the repo and commit
 */
function getRepoCommitPathLink(repoUrl: string, commit: string, path: string) {
  repoUrl = trimGitSuffix(repoUrl);
  return `${repoUrl}/blob/${commit}/${path}`;
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

/**
 * Get the repo org and repo name in format `${repoOrg}/${repoName}`
 */
function getRepoOrgName(repoUrl: string) {
  return trimGitPrefix(trimGitSuffix(repoUrl));
}

export {
  appendGitSuffix,
  trimGitSuffix,
  trimBranchPrefix,
  getDisplayCommit,
  getRepoTreeLink,
  getRepoPathLink,
  getRepoCommitLink,
  getRepoCommitPathLink,
  getRepoPrLink,
  getRepoOrgName,
};
