import type {
  ResourceKind,
  NamespacedResource,
} from "src/data/types/baseResourceTypes.ts";

interface Application extends NamespacedResource {
  kind: ResourceKind.Application;
  spec: ApplicationSpec;
}

interface ApplicationSpec {
  source: ApplicationSource;
}

interface ApplicationSource {
  repoURL: string;
  path: string;
}

export type { Application };
