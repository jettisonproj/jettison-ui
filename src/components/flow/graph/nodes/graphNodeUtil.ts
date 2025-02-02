import { flowDefaults } from "src/data/data.ts";
import { trimGitSuffix } from "src/components/flow/flowUtil.ts";

function getDisplayRepoName(repoUrl: string) {
  const { pathname } = new URL(repoUrl);
  return getDisplayRepoPath(pathname, repoUrl);
}

/**
 * Return the last path component as a shorthand for
 * displaying the repo name
 */
function getDisplayRepoPath(pathname: string, defaultValue: string) {
  const pathnameParts = pathname.split("/");

  let lastPathnamePart = pathnameParts.pop();

  // Handle potential trailing or duplicate slashes
  while (!lastPathnamePart && pathnameParts.length > 0) {
    lastPathnamePart = pathnameParts.pop();
  }

  if (!lastPathnamePart) {
    // If unable to find last path component, return the full url
    return defaultValue;
  }

  // Remove the .git suffix for readability
  return trimGitSuffix(lastPathnamePart);
}

/**
 * Get the link url to the root of the repo and baseRef
 */
function getRepoTreeLink(repoUrl: string, baseRef: string | undefined) {
  repoUrl = trimGitSuffix(repoUrl);
  baseRef = baseRef ?? flowDefaults.baseRef;
  return `${repoUrl}/tree/${baseRef}`;
}

export { getRepoTreeLink, getDisplayRepoName, getDisplayRepoPath };
