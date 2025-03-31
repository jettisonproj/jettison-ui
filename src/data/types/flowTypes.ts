interface Flow {
  spec: FlowSpec;
}

interface FlowSpec {
  steps: Step[];
  triggers: Trigger[];
}

enum StepSource {
  DockerBuildTest = "DockerBuildTest",
  DockerBuildTestPublish = "DockerBuildTestPublish",
  ArgoCD = "ArgoCD",
}

interface BaseStep {
  stepName?: string;
  stepSource: StepSource;
  dependsOn?: string[];
}

interface DockerBuildTestStep extends BaseStep {
  stepSource: StepSource.DockerBuildTest;
  dockerfilePath?: string;
  dockerContextDir?: string;
}

interface DockerBuildTestPublishStep extends BaseStep {
  stepSource: StepSource.DockerBuildTestPublish;
  dockerfilePath?: string;
  dockerContextDir?: string;
}

interface ArgoCDStep extends BaseStep {
  stepSource: StepSource.ArgoCD;
  repoUrl: string;
  repoPath: string;
  baseRef?: string;
}

type Step = DockerBuildTestStep | DockerBuildTestPublishStep | ArgoCDStep;

enum TriggerSource {
  GitHubPullRequest = "GitHubPullRequest",
  GitHubPush = "GitHubPush",
}

interface BaseTrigger {
  triggerName?: string;
  triggerSource: TriggerSource;
}

interface GitHubPullRequestTrigger extends BaseTrigger {
  triggerSource: TriggerSource.GitHubPullRequest;
  repoUrl: string;
  baseRef?: string;
  pullRequestEvents?: string[];
}

interface GitHubPushTrigger extends BaseTrigger {
  triggerSource: TriggerSource.GitHubPush;
  repoUrl: string;
  baseRef?: string | undefined;
}

type Trigger = GitHubPullRequestTrigger | GitHubPushTrigger;

export type {
  Flow,
  Trigger,
  GitHubPullRequestTrigger,
  GitHubPushTrigger,
  Step,
  DockerBuildTestStep,
  DockerBuildTestPublishStep,
  ArgoCDStep,
};

export { TriggerSource, StepSource };
