interface Flow {
  spec: FlowSpec;
}

interface FlowSpec {
  steps: Step[];
  triggers: Trigger[];
}

interface BaseStep {
  stepName?: string;
  stepSource: string;
  dependsOn?: string[];
}

interface DockerBuildTestStep extends BaseStep {
  stepSource: "dockerBuildTest";
  dockerfilePath?: string;
  dockerContextDir?: string;
}

interface DockerBuildTestPublishStep extends BaseStep {
  stepSource: "dockerBuildTestPublish";
  dockerfilePath?: string;
  dockerContextDir?: string;
}

interface ArgoCDStep extends BaseStep {
  stepSource: "argoCD";
  repoUrl: string;
  repoPath: string;
  baseRef?: string;
}

interface DebugMessageStep extends BaseStep {
  stepSource: "debugMessage";
  message: string;
}

interface ManualApprovalStep extends BaseStep {
  stepSource: "manualApproval";
}

type Step =
  | DockerBuildTestStep
  | DockerBuildTestPublishStep
  | ArgoCDStep
  | DebugMessageStep
  | ManualApprovalStep;

interface BaseTrigger {
  triggerName?: string;
  triggerSource: string;
}

interface GitHubPullRequestTrigger extends BaseTrigger {
  triggerSource: "githubPullRequest";
  repoUrl: string;
  baseRef?: string;
  pullRequestEvents?: string[];
}

interface GitHubPushTrigger extends BaseTrigger {
  triggerSource: "githubPush";
  repoUrl: string;
  baseRef?: string | undefined;
}

type Trigger = GitHubPullRequestTrigger | GitHubPushTrigger;


export type { Flow };
