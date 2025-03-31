enum ResourceKind {
  Flow = "Flow",
  Namespace = "Namespace",
}

interface BaseResource {
  kind: ResourceKind;
  metadata: Metadata;
}

interface Metadata {
  name: string;
  annotations?: Record<string, string>;
}

interface NamespacedMetadata extends Metadata {
  namespace: string;
}

interface NamespacedResource extends BaseResource {
  metadata: NamespacedMetadata;
}

export type { BaseResource, NamespacedResource };
export { ResourceKind };
