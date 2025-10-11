import type {
  ResourceKind,
  NamespacedResource,
} from "src/data/types/baseResourceTypes.ts";

interface Workflow extends NamespacedResource {
  kind: ResourceKind.Workflow;
  spec: WorkflowSpec;
  status: WorkflowStatus;
  // The memo field is not actually sent by the server
  // It contains memoized data computed in the client
  memo: WorkflowMemo;
}

interface WorkflowSpec {
  arguments: WorkflowArguments;
}

interface WorkflowArguments {
  parameters: WorkflowSpecParameter[];
}

interface WorkflowOptionalArguments {
  parameters?: WorkflowSpecParameter[];
}

interface WorkflowSpecParameter {
  name: string;
  value: string;
}

// These values are not sent by the server, but instead
// computed / derived on the client
interface WorkflowMemo {
  parameterMap: Record<string, string>;
  startedAt: Date;
  finishedAt?: Date;
  duration?: string;
  nodes: Record<string, WorkflowMemoStatusNode>;
  sortedNodes: WorkflowMemoStatusNode[];
}

interface WorkflowStatus {
  startedAt: string;
  finishedAt?: string;
  phase: WorkflowPhase;
  nodes?: Record<string, WorkflowStatusNode>;
}

interface WorkflowStatusNode {
  displayName: string;
  phase: NodePhase;
  startedAt: string;
  finishedAt?: string;
  inputs?: WorkflowArguments;
  outputs?: WorkflowOptionalArguments;
}

interface WorkflowMemoStatusNode {
  displayName: string;
  phase: NodePhase;
  startedAt: Date;
  finishedAt?: Date;
  duration?: string;
  parameterMap: Record<string, string>;
  outputMap: Record<string, string>;
}

// SOT: https://pkg.go.dev/github.com/argoproj/argo-workflows/v3@v3.7.0/pkg/apis/workflow/v1alpha1#WorkflowPhase
enum WorkflowPhase {
  Unknown = "",
  // pending some set-up - rarely used
  Pending = "Pending",
  // any node has started; pods might not be running yet, the workflow maybe suspended too
  Running = "Running",
  Succeeded = "Succeeded",
  // it maybe that the workflow was terminated
  Failed = "Failed",
  Error = "Error",
}

// SOT: https://pkg.go.dev/github.com/argoproj/argo-workflows/v3@v3.7.0/pkg/apis/workflow/v1alpha1#NodePhase
enum NodePhase {
  // Node is waiting to run
  Pending = "Pending",
  // Node is running
  Running = "Running",
  // Node finished with no errors
  Succeeded = "Succeeded",
  // Node was skipped
  Skipped = "Skipped",
  // Node or child of node exited with non-0 code
  Failed = "Failed",
  // Node had an error other than a non 0 exit code
  Error = "Error",
  // Node was omitted because its `depends` condition was not met (only relevant in DAGs)
  Omitted = "Omitted",
}

export type { Workflow, WorkflowMemoStatusNode };
export { WorkflowPhase, NodePhase };
