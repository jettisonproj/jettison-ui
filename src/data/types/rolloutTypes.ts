import type {
  ResourceKind,
  NamespacedResource,
} from "src/data/types/baseResourceTypes.ts";

interface Rollout extends NamespacedResource {
  kind: ResourceKind.Rollout;
  status: RolloutStatus;
}

interface RolloutStatus {
  phase: RolloutPhase;
}

// SOT: https://pkg.go.dev/github.com/argoproj/argo-rollouts/pkg/apis/rollouts/v1alpha1#RolloutPhase
enum RolloutPhase {
  // RolloutPhaseHealthy indicates a rollout is healthy
  Healthy = "Healthy",
  // RolloutPhaseDegraded indicates a rollout is degraded (e.g. pod unavailability, misconfiguration)
  Degraded = "Degraded",
  // RolloutPhaseProgressing indicates a rollout is not yet healthy but still making progress towards a healthy state
  Progressing = "Progressing",
  // RolloutPhasePaused indicates a rollout is not yet healthy and will not make progress until unpaused
  Paused = "Paused",
}

export type { Rollout };
export { RolloutPhase };
