import type { NamespacedResource } from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

interface ContainerLog extends NamespacedResource {
  kind: typeof ResourceKinds.ContainerLog;
  spec: ContainerLogSpec;
}

interface ContainerLogSpec {
  containerName: string;
  logLines: string[];
}

export type { ContainerLog };
