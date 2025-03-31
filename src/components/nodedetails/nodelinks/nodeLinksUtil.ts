import { trimGitSuffix } from "src/components/flow/flowUtil.ts";
import { flowDefaults } from "src/data/data.ts";

/**
 * Get the link url to the root of the repo and baseRef
 */
function getRepoTreeLink(repoUrl: string, baseRef: string | undefined) {
  repoUrl = trimGitSuffix(repoUrl);
  baseRef = baseRef ?? flowDefaults.baseRef;
  return `${repoUrl}/tree/${baseRef}`;
}

export { getRepoTreeLink };
