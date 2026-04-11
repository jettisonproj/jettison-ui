const ResourceKinds = {
  Flow: "Flow",
  Application: "Application",
  Rollout: "Rollout",
  Workflow: "Workflow",
  Pod: "Pod",
  ContainerLog: "ContainerLog",
} as const;
type ResourceKind = (typeof ResourceKinds)[keyof typeof ResourceKinds];

interface BaseResource {
  kind: ResourceKind;
  metadata: Metadata;
}

interface Metadata {
  name: string;
  annotations?: Record<string, string>;
  labels?: Record<string, string>;
}

interface NamespacedMetadata extends Metadata {
  namespace: string;
}

interface NamespacedResource extends BaseResource {
  metadata: NamespacedMetadata;
}

export { ResourceKinds };
export type { BaseResource, NamespacedResource, ResourceKind };
