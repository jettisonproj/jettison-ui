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
  id: string;
  name: string;
  displayName: string;
  phase: NodePhase;
  type: NodeType;
  templateRef: NodeTemplateRef;
  startedAt: string;
  finishedAt?: string;
  inputs?: WorkflowArguments;
  outputs?: WorkflowOptionalArguments;
  children?: string[];
}

interface NodeTemplateRef {
  template: TemplateName;
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

// SOT: https://pkg.go.dev/github.com/argoproj/argo-workflows/v3@v3.7.0/pkg/apis/workflow/v1alpha1#NodeType
// Currently, only a subset is needed
enum NodeType {
  Pod = "Pod",
  Container = "Container",
  DAG = "DAG",
  Skipped = "Skipped",
}

// SOT: https://github.com/jettisonproj/jettison-controller/blob/main/internal/workflowtemplates/workflowtemplates.go
enum TemplateName {
  GitHubCheckStart = "deploy-step-github-check-start",
  DockerBuildTest = "docker-build-test",
  DockerBuildTestPublish = "docker-build-test-publish",
  ArgoCD = "deploy-step-argocd",
  GitHubCheckComplete = "deploy-step-github-check-complete",
}

export type {
  Workflow,
  WorkflowStatusNode,
  WorkflowMemoStatusNode,
  WorkflowSpecParameter,
};
export { WorkflowPhase, NodePhase, NodeType, TemplateName };
