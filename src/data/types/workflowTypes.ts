import type {
  NamespacedMetadata,
  NamespacedResource,
} from "src/data/types/baseResourceTypes.ts";
import { ResourceKinds } from "src/data/types/baseResourceTypes.ts";

interface Workflow extends NamespacedResource {
  kind: typeof ResourceKinds.Workflow;
  metadata: WorkflowMetadata;
  spec: WorkflowSpec;
  status: WorkflowStatus;
  // The memo field is not actually sent by the server
  // It contains memoized data computed in the client
  memo: WorkflowMemo;
}

interface WorkflowMetadata extends NamespacedMetadata {
  uid: string;
}

interface WorkflowSpec {
  arguments: WorkflowArguments;
}

interface WorkflowArguments {
  parameters: WorkflowParameter[];
}

interface WorkflowOutputs {
  parameters?: WorkflowParameter[];
  artifacts?: WorkflowArtifact[];
}

interface WorkflowParameter {
  name: string;
  value: string;
}

interface WorkflowArtifact {
  name: string;
  path: string;
  s3: WorkflowS3Artifact;
}

interface WorkflowS3Artifact {
  key: string;
}

// These values are not sent by the server, but instead
// computed / derived on the client
interface WorkflowMemo {
  parameterMap: Record<string, string>;
  startedAt?: Date;
  finishedAt?: Date;
  duration?: string;
  nodes: Record<string, WorkflowMemoStatusNode>;
  sortedNodes: WorkflowMemoStatusNode[];
}

interface WorkflowStatus {
  startedAt?: string;
  finishedAt?: string;
  phase?: WorkflowPhase;
  nodes?: Record<string, WorkflowStatusNode>;
}

interface WorkflowStatusNode {
  id: string;
  name: string;
  displayName: string;
  phase: NodePhase;
  type: NodeType;
  templateRef?: NodeTemplateRef;
  templateName?: string;
  startedAt: string;
  finishedAt?: string;
  inputs?: WorkflowArguments;
  outputs?: WorkflowOutputs;
  children?: string[];
  memo: WorkflowMemoStatusNode;
}

interface NodeTemplateRef {
  template: TemplateName;
}

interface WorkflowMemoStatusNode {
  displayName: string;
  phase: NodePhase;
  template: TemplateName;
  startedAt: Date;
  finishedAt?: Date;
  duration?: string;
  parameterMap: Record<string, string>;
  outputMap: Record<string, string>;
}

// SOT: https://pkg.go.dev/github.com/argoproj/argo-workflows/v3@v3.7.0/pkg/apis/workflow/v1alpha1#WorkflowPhase
const WorkflowPhases = {
  Unknown: "",
  // pending some set-up - rarely used
  Pending: "Pending",
  // any node has started; pods might not be running yet, the workflow maybe suspended too
  Running: "Running",
  Succeeded: "Succeeded",
  // it maybe that the workflow was terminated
  Failed: "Failed",
  Error: "Error",
} as const;
type WorkflowPhase = (typeof WorkflowPhases)[keyof typeof WorkflowPhases];

// SOT: https://pkg.go.dev/github.com/argoproj/argo-workflows/v3@v3.7.0/pkg/apis/workflow/v1alpha1#NodePhase
const NodePhases = {
  // Node is waiting to run
  Pending: "Pending",
  // Node is running
  Running: "Running",
  // Node finished with no errors
  Succeeded: "Succeeded",
  // Node was skipped
  Skipped: "Skipped",
  // Node or child of node exited with non-0 code
  Failed: "Failed",
  // Node had an error other than a non 0 exit code
  Error: "Error",
  // Node was omitted because its `depends` condition was not met (only relevant in DAGs)
  Omitted: "Omitted",
} as const;
type NodePhase = (typeof NodePhases)[keyof typeof NodePhases];

// SOT: https://pkg.go.dev/github.com/argoproj/argo-workflows/v3@v3.7.0/pkg/apis/workflow/v1alpha1#NodeType
// Currently, only a subset is needed
const NodeTypes = {
  Pod: "Pod",
  Container: "Container",
  DAG: "DAG",
  Skipped: "Skipped",
} as const;
type NodeType = (typeof NodeTypes)[keyof typeof NodeTypes];

// SOT: https://github.com/jettisonproj/jettison-controller/blob/main/internal/workflowtemplates/workflowtemplates.go
// Ensure longer strings come first since template overrides can append to this name
// See https://github.com/jettisonproj/jettison-controller/blob/main/internal/controller/sensorbuilder/sensor_trigger_tasks.go
const TemplateNames = {
  GitHubCheckComplete: "deploy-step-github-check-complete",
  GitHubCheckStart: "deploy-step-github-check-start",
  DockerBuildTestPublish: "docker-build-test-publish",
  DockerBuildTest: "docker-build-test",
  ArgoCD: "deploy-step-argocd",
} as const;
type TemplateName = (typeof TemplateNames)[keyof typeof TemplateNames];
const TemplateNameValues: TemplateName[] = Object.values(TemplateNames);

export {
  NodePhases,
  NodeTypes,
  TemplateNames,
  TemplateNameValues,
  WorkflowPhases,
};
export type {
  NodePhase,
  NodeType,
  TemplateName,
  Workflow,
  WorkflowArtifact,
  WorkflowMemoStatusNode,
  WorkflowParameter,
  WorkflowPhase,
  WorkflowStatusNode,
};
