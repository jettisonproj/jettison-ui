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

export { namespaces, recentFlows, stats };
