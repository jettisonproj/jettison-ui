import { flowDefaults } from "src/data/data.ts";

const COMMIT_DISPLAY_LEN = 7;
const BRANCH_PREFIX = "refs/heads/";
const GIT_SUFFIX = ".git";
const GIT_PREFIX = "https://github.com/";

function appendGitSuffix(s: string): string {
  if (s.endsWith(GIT_SUFFIX)) {
    return s;
  }
  return `${s}${GIT_SUFFIX}`;
}

function trimGitSuffix(s: string): string {
  if (s.endsWith(GIT_SUFFIX)) {
    return s.slice(0, -1 * GIT_SUFFIX.length);
  }
  return s;
}

function trimGitPrefix(s: string): string {
  if (s.startsWith(GIT_PREFIX)) {
    return s.slice(GIT_PREFIX.length);
  }
  return s;
}

function trimBranchPrefix(branch: string): string {
  if (branch.startsWith(BRANCH_PREFIX)) {
    return branch.slice(BRANCH_PREFIX.length);
  }
  return branch;
}

function getDisplayCommit(commit: string): string {
  return commit.slice(0, COMMIT_DISPLAY_LEN);
}

/**
 * Get the link url to the root of the repo and baseRef
 */
function getRepoTreeLink(repoUrl: string, baseRef: string | undefined): string {
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
): string {
  const repoTreeLink = getRepoTreeLink(repoUrl, baseRef);
  return `${repoTreeLink}/${path}`;
}

/**
 * Get the link url to the author using the repo and baseRef
 * https://github.com/kubernetes/kubernetes/commits/release-1.36?author=richabanker
 */
function getRepoAuthorLink(
  repoUrl: string,
  baseRef: string,
  author: string,
): string {
  repoUrl = trimGitSuffix(repoUrl);
  return `${repoUrl}/commits/${baseRef}?author=${author}`;
}

/*
 * Get the link to the path using the repo and commit
 */
function getRepoCommitPathLink(
  repoUrl: string,
  commit: string,
  path: string,
): string {
  repoUrl = trimGitSuffix(repoUrl);
  return `${repoUrl}/blob/${commit}/${path}`;
}

/**
 * Get the link url to the commit in the repo
 */
function getRepoCommitLink(repoUrl: string, commit: string): string {
  repoUrl = trimGitSuffix(repoUrl);
  return `${repoUrl}/commit/${commit}`;
}

/**
 * Get the link url to the PR in the repo
 */
function getRepoPrLink(repoUrl: string, prNumber: string): string {
  repoUrl = trimGitSuffix(repoUrl);
  return `${repoUrl}/pull/${prNumber}`;
}

/**
 * Get the repo org and repo name in format `${repoOrg}/${repoName}`
 */
function getRepoOrgName(repoUrl: string): string {
  return trimGitPrefix(trimGitSuffix(repoUrl));
}

/**
 * Given the repo org and repo name in format `${repoOrg}/${repoName}`,
 * Return [repoOrg, repoName]
 */
function getRepoOrgAndName(repoOrgName: string): [string, string] {
  const repoOrgNameParts = repoOrgName.split("/");
  if (repoOrgNameParts.length !== 2) {
    throw new GitUtilError(`invalid repoOrgName: ${repoOrgName}`);
  }
  const [repoOrg, repoName] = repoOrgNameParts;
  if (repoOrg == null || repoName == null) {
    throw new GitUtilError(`invalid repoOrgName: ${repoOrgName}`);
  }
  return [repoOrg, repoName];
}

/**
 * Given the two repo orgs and names in format `${repoOrg}/${repoName}`,
 * return the comparison result of sorting by repo name
 */
function sortByRepoName(repoOrgNameA: string, repoOrgNameB: string): number {
  const [, repoNameA] = getRepoOrgAndName(repoOrgNameA);
  const [, repoNameB] = getRepoOrgAndName(repoOrgNameB);
  return repoNameA.localeCompare(repoNameB);
}

function getRepoLink(repoOrg: string, repoName: string): string {
  return `${GIT_PREFIX}${repoOrg}/${repoName}`;
}

/**
 * Return the last path component as a shorthand for
 * displaying the repo name
 */
function getDisplayRepoPath(pathname: string, defaultValue: string): string {
  const pathnameParts = pathname.split("/");

  let lastPathnamePart = pathnameParts.pop();

  // Handle potential trailing or duplicate slashes
  while (!lastPathnamePart && pathnameParts.length > 0) {
    lastPathnamePart = pathnameParts.pop();
  }

  if (!lastPathnamePart) {
    // If unable to find the last path component, return the default value
    return defaultValue;
  }

  // Remove the .git suffix for readability
  return trimGitSuffix(lastPathnamePart);
}

class GitUtilError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export {
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
};
