import type { Flow, Step, Trigger } from "src/data/types/flowTypes.ts";
import { StepType, TriggerType } from "src/data/types/flowTypes.ts";

const stats = {
  namespaces: 5,
  flows: 5,
  triggers: 5,
  steps: 5,
};

const recentFlows = ["rollouts-demo/github-push", "rollouts-demo/github-pr"];

const namespaces = [
  "argo",
  "argo-events",
  "argo-rollouts",
  "argocd",
  "cert-manager",
  "cilium-secrets",
  "default",
  "jettison-controller-system",
  "kube-node-lease",
  "kube-public",
  "kube-system",
  "kubernetes-dashboard",
  "monitoring",
  "nats",
  "nginx-cicd-argo",
  "osoriano",
  "rollouts-demo",
  "wavesmusicplayer",
];

const flowsByNamespace: Record<string, string[] | undefined> = {
  "rollouts-demo": ["github-pr", "github-push"],
};

const gitHubPrFlow: Flow = {
  spec: {
    steps: [
      {
        stepSource: StepType.DockerBuildTest,
      },
    ],
    triggers: [
      {
        repoUrl: "https://github.com/osoriano/rollouts-demo.git",
        triggerSource: TriggerType.GitHubPullRequest,
      },
    ],
  },
};

const gitHubPushFlow: Flow = {
  spec: {
    steps: [
      {
        stepName: "docker-build-test-publish",
        stepSource: StepType.DockerBuildTestPublish,
      },
      {
        dependsOn: ["docker-build-test-publish"],
        repoPath: "dev",
        repoUrl: "https://github.com/osoriano/rollouts-demo-argo-configs.git",
        stepName: "deploy-to-dev",
        stepSource: StepType.ArgoCD,
      },
      {
        dependsOn: ["docker-build-test-publish"],
        repoPath: "staging",
        repoUrl: "https://github.com/osoriano/rollouts-demo-argo-configs.git",
        stepName: "deploy-to-staging",
        stepSource: StepType.ArgoCD,
      },
      {
        dependsOn: ["deploy-to-staging"],
        repoPath: "prod",
        repoUrl: "https://github.com/osoriano/rollouts-demo-argo-configs.git",
        stepName: "deploy-to-prod",
        stepSource: StepType.ArgoCD,
      },
    ],
    triggers: [
      {
        repoUrl: "https://github.com/osoriano/rollouts-demo.git",
        triggerName: "github-push",
        triggerSource: TriggerType.GitHubPush,
      },
    ],
  },
};

const flowByNamespaceName: Record<
  string,
  Record<string, Flow | undefined> | undefined
> = {
  "rollouts-demo": {
    "github-pr": gitHubPrFlow,
    "github-push": gitHubPushFlow,
  },
};

// todo need to get defaults from backend, or bake default into types
const flowDefaults = {
  baseRef: "main",
  dockerfilePath: "Dockerfile",
};
// todo need to get defaults from backend, or bake default into types
function flowDefaultStepName(step: Step) {
  return step.stepName ?? step.stepSource;
}

// todo need to get defaults from backend, or bake default into types
function flowDefaultTriggerName(trigger: Trigger) {
  return trigger.triggerName ?? trigger.triggerSource;
}

export {
  flowsByNamespace,
  flowByNamespaceName,
  namespaces,
  recentFlows,
  stats,
  flowDefaults,
  flowDefaultStepName,
  flowDefaultTriggerName,
};
