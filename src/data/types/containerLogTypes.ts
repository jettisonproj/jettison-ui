import type {
  ResourceKind,
  NamespacedResource,
} from "src/data/types/baseResourceTypes.ts";

interface ContainerLog extends NamespacedResource {
  kind: ResourceKind.ContainerLog;
  spec: ContainerLogSpec;
}

interface ContainerLogSpec {
  containerName: string;
  logLines: string[];
}

export type { ContainerLog };
