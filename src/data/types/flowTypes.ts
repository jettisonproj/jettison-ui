import type { NamespacedResource } from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

interface Flow extends NamespacedResource {
  kind: typeof ResourceKinds.Flow;
  spec: FlowSpec;
  // The memo field is not actually sent by the server
  // It contains memoized data computed in the client
  memo: FlowMemo;
}

interface FlowSpec {
  steps: Step[];
  triggers: Trigger[];
}

// These values are not sent by the server, but instead
// computed / derived on the client
interface FlowMemo {
  trigger: Trigger;
  isPrFlow: boolean;
}

const StepSources = {
  DockerBuildTest: "DockerBuildTest",
  DockerBuildTestPublish: "DockerBuildTestPublish",
  ArgoCD: "ArgoCD",
} as const;
type StepSource = (typeof StepSources)[keyof typeof StepSources];

interface BaseStep {
  stepName?: string;
  stepSource: StepSource;
  dependsOn?: string[];
}

interface DockerBuildTestStep extends BaseStep {
  stepSource: typeof StepSources.DockerBuildTest;
  dockerfilePath?: string;
  dockerContextDir?: string;
}

interface DockerBuildTestPublishStep extends BaseStep {
  stepSource: typeof StepSources.DockerBuildTestPublish;
  dockerfilePath?: string;
  dockerContextDir?: string;
}

interface ArgoCDStep extends BaseStep {
  stepSource: typeof StepSources.ArgoCD;
  repoUrl: string;
  repoPath: string;
  baseRef?: string;
  pausedReason?: string;
}

type Step = DockerBuildTestStep | DockerBuildTestPublishStep | ArgoCDStep;

const TriggerSources = {
  GitHubPullRequest: "GitHubPullRequest",
  GitHubPush: "GitHubPush",
} as const;
type TriggerSource = (typeof TriggerSources)[keyof typeof TriggerSources];

interface BaseTrigger {
  triggerName?: string;
  triggerSource: TriggerSource;
}

interface GitHubPullRequestTrigger extends BaseTrigger {
  triggerSource: typeof TriggerSources.GitHubPullRequest;
  repoUrl: string;
  baseRef?: string;
  pullRequestEvents?: string[];
}

interface GitHubPushTrigger extends BaseTrigger {
  triggerSource: typeof TriggerSources.GitHubPush;
  repoUrl: string;
  baseRef?: string | undefined;
}

type Trigger = GitHubPullRequestTrigger | GitHubPushTrigger;

interface PushPrFlows {
  pushFlow?: Flow;
  prFlow?: Flow;
}

export type {
  Flow,
  Trigger,
  GitHubPullRequestTrigger,
  GitHubPushTrigger,
  Step,
  DockerBuildTestStep,
  DockerBuildTestPublishStep,
  ArgoCDStep,
  PushPrFlows,
};

export { TriggerSources, StepSources };
export type { StepSource, TriggerSource };
