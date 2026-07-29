// SOT: https://pkg.go.dev/github.com/argoproj/argo-rollouts/pkg/apis/rollouts/v1alpha1#CanaryStep
const CANARY_STEP_DESCRIPTIONS = {
  Pause: "Waits for the specified time before continuing the deployment",
  SetWeight:
    "Configures percentage of pods to roll out to, based on the replicas configured for the deployment",
  SetCanaryScale:
    "Defines how to scale the new pods without changing the traffic weight",
  Analysis: "Defines the analysis that will run before continuing",
} as const;

export { CANARY_STEP_DESCRIPTIONS };
