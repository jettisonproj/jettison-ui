import type { NamespacedResource } from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

interface Pod extends NamespacedResource {
  kind: typeof ResourceKinds.Pod;
  spec: PodSpec;
  status: PodStatus;
}

interface PodSpec {
  containers: Container[];
  initContainers: Container[];
}

interface Container {
  name: string;
}

// SOT: https://pkg.go.dev/k8s.io/api/core/v1#PodStatus
interface PodStatus {
  phase: PodPhase;
  containerStatuses?: ContainerStatus[];
}

// SOT: https://pkg.go.dev/k8s.io/api/core/v1#ContainerStatus
interface ContainerStatus {
  ready: boolean;
}

// SOT: https://pkg.go.dev/k8s.io/api/core/v1#PodPhase
const PodPhases = {
  // Pending means the pod has been accepted by the system, but one or more of the containers
  // has not been started. This includes time before being bound to a node, as well as time spent
  // pulling images onto the host.
  Pending: "Pending",
  // PodRunning means the pod has been bound to a node and all of the containers have been started.
  // At least one container is still running or is in the process of being restarted.
  Running: "Running",
  // PodSucceeded means that all containers in the pod have voluntarily terminated
  // with a container exit code of 0, and the system is not going to restart any of these containers.
  Succeeded: "Succeeded",
  // PodFailed means that all containers in the pod have terminated, and at least one container has
  // terminated in a failure (exited with a non-zero exit code or was stopped by the system).
  Failed: "Failed",
} as const;
type PodPhase = (typeof PodPhases)[keyof typeof PodPhases];

export { PodPhases };
export type { Container, Pod };
