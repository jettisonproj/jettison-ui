import type { NamespacedResource } from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

// SOT: https://pkg.go.dev/github.com/argoproj/argo-cd/v3@v3.4.5/pkg/apis/application/v1alpha1#Application
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

// SOT: https://pkg.go.dev/github.com/argoproj/argo-cd/v3@v3.4.5/pkg/apis/application/v1alpha1#ApplicationStatus
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

// SOT: https://pkg.go.dev/github.com/argoproj/argo-cd/v3@v3.4.5/pkg/apis/application/v1alpha1#SyncStatusCode
const SyncStatusCodes = {
  // Unknown indicates that the status of a sync could not be reliably determined
  Unknown: "Unknown",
  // Synced indicates that desired and live states match
  Synced: "Synced",
  // OutOfSync indicates that there is a drift between desired and live states
  OutOfSync: "OutOfSync",
} as const;
type SyncStatusCode = (typeof SyncStatusCodes)[keyof typeof SyncStatusCodes];

// SOT: https://pkg.go.dev/github.com/argoproj/argo-cd/v3@v3.4.5/pkg/apis/application/v1alpha1#SyncStatus
interface ApplicationStatusSync {
  status: SyncStatusCode;
  revision: string;
}

// SOT: https://pkg.go.dev/github.com/argoproj/argo-cd/gitops-engine/pkg/health#HealthStatusCode
const HealthStatusCodes = {
  // Indicates that health assessment failed and actual health status is unknown
  Unknown: "Unknown",
  // Progressing health status means that resource is not healthy but still have a chance to reach healthy state
  Progressing: "Progressing",
  // Resource is 100% healthy
  Healthy: "Healthy",
  // Assigned to resources that are suspended or paused. The typical example is a
  // [suspended](https://kubernetes.io/docs/tasks/job/automated-tasks-with-cron-jobs/#suspend) CronJob.
  Suspended: "Suspended",
  // Degrade status is used if resource status indicates failure or resource could not reach healthy state
  // within some timeout.
  Degraded: "Degraded",
  // Indicates that resource is missing in the cluster.
  Missing: "Missing",
} as const;
type HealthStatusCode =
  (typeof HealthStatusCodes)[keyof typeof HealthStatusCodes];

interface ApplicationStatusHealth {
  status: HealthStatusCode;
}

export type { Application, ApplicationStatusResource, HealthStatusCode };

export { HealthStatusCodes, SyncStatusCodes };
