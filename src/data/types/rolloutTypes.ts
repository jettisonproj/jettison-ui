import type { NamespacedResource } from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

interface Rollout extends NamespacedResource {
  kind: typeof ResourceKinds.Rollout;
  spec: RolloutSpec;
  status: RolloutStatus;
}

interface RolloutSpec {
  strategy: RolloutStrategy;
}

interface RolloutStrategy {
  canary: RolloutCanaryStrategy;
}

interface RolloutCanaryStrategy {
  steps: RolloutCanaryStep[];
}

// SOT: https://pkg.go.dev/github.com/argoproj/argo-rollouts/pkg/apis/rollouts/v1alpha1#CanaryStep
interface RolloutCanaryStep {
  setCanaryScale?: SetCanaryScaleStep;
  analysis?: RolloutAnalysisStep;
  pause?: RolloutPauseStep;
  setWeight?: number;
}

interface SetCanaryScaleStep {
  weight?: number;
  matchTrafficWeight?: boolean;
}

interface RolloutAnalysisStep {
  templates: AnalysisTemplateRef[];
  args: AnalysisRunArgument[];
}

interface AnalysisTemplateRef {
  templateName: string;
}

interface AnalysisRunArgument {
  name: string;
  value: string;
}

interface RolloutPauseStep {
  duration: string;
}

interface RolloutStatus {
  phase: RolloutPhase;
  currentStepIndex: number;
}

// SOT: https://pkg.go.dev/github.com/argoproj/argo-rollouts/pkg/apis/rollouts/v1alpha1#RolloutPhase
const RolloutPhases = {
  // RolloutPhaseHealthy indicates a rollout is healthy
  Healthy: "Healthy",
  // RolloutPhaseDegraded indicates a rollout is degraded (e.g. pod unavailability, misconfiguration)
  Degraded: "Degraded",
  // RolloutPhaseProgressing indicates a rollout is not yet healthy but still making progress towards a healthy state
  Progressing: "Progressing",
  // RolloutPhasePaused indicates a rollout is not yet healthy and will not make progress until unpaused
  Paused: "Paused",
} as const;
type RolloutPhase = (typeof RolloutPhases)[keyof typeof RolloutPhases];

export { RolloutPhases };
export type {
  Rollout,
  RolloutAnalysisStep,
  RolloutCanaryStep,
  RolloutPauseStep,
  RolloutPhase,
  SetCanaryScaleStep,
};
