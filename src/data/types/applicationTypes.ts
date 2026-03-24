import type { NamespacedResource } from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

interface Application extends NamespacedResource {
  kind: typeof ResourceKinds.Application;
  spec: ApplicationSpec;
  status: ApplicationStatus;
}

interface ApplicationSpec {
  source: ApplicationSource;
  syncPolicy: ApplicationSyncPolicy;
}

interface ApplicationSource {
  repoURL: string;
  path: string;
}

interface ApplicationSyncPolicy {
  automated: ApplicationSyncPolicyAutomated;
}

interface ApplicationSyncPolicyAutomated {
  enabled: boolean;
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

export type { Application, ApplicationStatusResource };
