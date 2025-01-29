interface Flow {
  spec: FlowSpec;
}

interface FlowSpec {
  steps: Step[];
  triggers: Trigger[];
}

enum StepType {
  DockerBuildTest = "dockerBuildTest",
  DockerBuildTestPublish = "dockerBuildTestPublish",
  ArgoCD = "argoCD",
}

interface BaseStep {
  stepName?: string;
  stepSource: StepType;
  dependsOn?: string[];
}

interface DockerBuildTestStep extends BaseStep {
  stepSource: StepType.DockerBuildTest;
  dockerfilePath?: string;
  dockerContextDir?: string;
}

interface DockerBuildTestPublishStep extends BaseStep {
  stepSource: StepType.DockerBuildTestPublish;
  dockerfilePath?: string;
  dockerContextDir?: string;
}

interface ArgoCDStep extends BaseStep {
  stepSource: StepType.ArgoCD;
  repoUrl: string;
  repoPath: string;
  baseRef?: string;
}

type Step = DockerBuildTestStep | DockerBuildTestPublishStep | ArgoCDStep;

enum TriggerType {
  GitHubPullRequest = "githubPullRequest",
  GitHubPush = "githubPush",
}

interface BaseTrigger {
  triggerName?: string;
  triggerSource: TriggerType;
}

interface GitHubPullRequestTrigger extends BaseTrigger {
  triggerSource: TriggerType.GitHubPullRequest;
  repoUrl: string;
  baseRef?: string;
  pullRequestEvents?: string[];
}

interface GitHubPushTrigger extends BaseTrigger {
  triggerSource: TriggerType.GitHubPush;
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

export { TriggerType, StepType };
