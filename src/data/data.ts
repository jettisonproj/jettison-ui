import type { Flow } from "src/data/types.ts"

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
        stepSource: "dockerBuildTest",
      },
    ],
    triggers: [
      {
        repoUrl: "https://github.com/osoriano/rollouts-demo.git",
        triggerSource: "githubPullRequest",
      },
    ],
  },
};

const gitHubPushFlow: Flow = {
  spec: {
    steps: [
      {
        stepName: "docker-build-test-publish",
        stepSource: "dockerBuildTestPublish",
      },
      {
        dependsOn: ["docker-build-test-publish"],
        repoPath: "dev",
        repoUrl: "https://github.com/osoriano/rollouts-demo-argo-configs.git",
        stepName: "deploy-to-dev",
        stepSource: "argoCD",
      },
      {
        dependsOn: ["docker-build-test-publish"],
        repoPath: "staging",
        repoUrl: "https://github.com/osoriano/rollouts-demo-argo-configs.git",
        stepName: "deploy-to-staging",
        stepSource: "argoCD",
      },
      {
        dependsOn: ["deploy-to-staging"],
        stepName: "approve-to-prod",
        stepSource: "manualApproval",
      },
      {
        dependsOn: ["approve-to-prod"],
        repoPath: "prod",
        repoUrl: "https://github.com/osoriano/rollouts-demo-argo-configs.git",
        stepName: "deploy-to-prod",
        stepSource: "argoCD",
      },
    ],
    triggers: [
      {
        repoUrl: "https://github.com/osoriano/rollouts-demo.git",
        triggerName: "github-push",
        triggerSource: "githubPush",
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

export {
  flowsByNamespace,
  flowByNamespaceName,
  namespaces,
  recentFlows,
  stats,
};
