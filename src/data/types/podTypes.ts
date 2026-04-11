import type { NamespacedResource } from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

interface Pod extends NamespacedResource {
  kind: typeof ResourceKinds.Pod;
  spec: PodSpec;
}

interface PodSpec {
  containers: Container[];
  initContainers: Container[];
}

interface Container {
  name: string;
}

export type { Container, Pod };
