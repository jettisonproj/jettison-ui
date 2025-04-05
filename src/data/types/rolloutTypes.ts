import type {
  ResourceKind,
  NamespacedResource,
} from "src/data/types/baseResourceTypes.ts";

interface Rollout extends NamespacedResource {
  kind: ResourceKind.Rollout;
  status: RolloutStatus;
}

interface RolloutStatus {
  phase: string;
}

export type { Rollout };
