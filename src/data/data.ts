import type { Flow, Step, Trigger } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
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

const flowsByNamespace: Record<string, string[]> = {
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

const flowByNamespaceName: Record<string, Record<string, Flow>> = {
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

const gitHubPushHistoryItem: Workflow = {
  metadata: {
    name: "github-push-5e1171d-rqqxr",
  },
  spec: {
    arguments: {
      parameters: [
        {
          name: "repo",
          value: "https://github.com/osoriano/rollouts-demo.git",
        },
        {
          name: "revision",
          value: "5e1171d752f7b819907b38924826061d3f6e1748",
        },
      ],
    },
  },
  status: {
    startedAt: "2025-01-20T21:48:18Z",
    finishedAt: "2025-01-20T22:41:33Z",
    phase: "Succeeded",
    progress: "7/7",
  },
};

const gitHubPrHistoryItem: Workflow = {
  metadata: {
    name: "github-pr-14-2a788d0-rpfzz",
  },
  spec: {
    arguments: {
      parameters: [
        {
          name: "repo",
          value: "https://github.com/osoriano/rollouts-demo.git",
        },
        {
          name: "revision",
          value: "2a788d0402454f2edac587c4840de3435330fde7",
        },
      ],
    },
  },
  status: {
    startedAt: "2025-01-20T21:27:35Z",
    finishedAt: "2025-01-20T21:29:45Z",
    phase: "Succeeded",
    progress: "3/3",
  },
};

const workflowsByNamespaceName: Record<string, Record<string, Workflow[]>> = {
  "rollouts-demo": {
    "github-push": [gitHubPushHistoryItem],
    "github-pr": [gitHubPrHistoryItem],
  },
};

export {
  flowsByNamespace,
  flowByNamespaceName,
  namespaces,
  recentFlows,
  stats,
  flowDefaults,
  flowDefaultStepName,
  flowDefaultTriggerName,
  workflowsByNamespaceName,
};
