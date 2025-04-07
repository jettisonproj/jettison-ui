import type {
  ResourceKind,
  NamespacedResource,
} from "src/data/types/baseResourceTypes.ts";

interface Application extends NamespacedResource {
  kind: ResourceKind.Application;
  spec: ApplicationSpec;
  status: ApplicationStatus;
}

interface ApplicationSpec {
  source: ApplicationSource;
}

interface ApplicationSource {
  repoURL: string;
  path: string;
}

interface ApplicationStatus {
  resources: ApplicationStatusResource[];
  sync: ApplicationStatusSync;
  health: ApplicationStatusHealth;
}

interface ApplicationStatusResource {
  kind: string;
  namespace: string;
  name: string;
}

interface ApplicationStatusSync {
  status: string;
  revision: string;
}

interface ApplicationStatusHealth {
  status: string;
}

export type { Application };
