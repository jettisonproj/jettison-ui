import { getRepoTreeLink } from "src/components/nodedetails/nodelinks/nodeLinksUtil.ts";
import type {
  GitHubPullRequestTrigger,
  GitHubPushTrigger,
} from "src/data/types/flowTypes.ts";

interface GitHubTriggerLinksProps {
  trigger: GitHubPullRequestTrigger | GitHubPushTrigger;
}
function GitHubTriggerLinks({ trigger }: GitHubTriggerLinksProps) {
  const repoLink = getRepoTreeLink(trigger.repoUrl, trigger.baseRef);
  return (
    <ul>
      <li>
        <a href={repoLink} target="_blank" rel="noreferrer">
          Repo URL
        </a>
      </li>
    </ul>
  );
}

export { GitHubTriggerLinks };
