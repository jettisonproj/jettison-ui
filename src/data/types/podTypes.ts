import type {
  ResourceKind,
  NamespacedResource,
} from "src/data/types/baseResourceTypes.ts";

interface Pod extends NamespacedResource {
  kind: ResourceKind.Pod;
  spec: PodSpec;
}

interface PodSpec {
  containers: Container[];
  initContainers: Container[];
}

interface Container {
  name: string;
}

export type { Pod, Container };
