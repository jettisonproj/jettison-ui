import type {
  ResourceKind,
  NamespacedResource,
} from "src/data/types/baseResourceTypes.ts";

interface Workflow extends NamespacedResource {
  kind: ResourceKind.Workflow;
  spec: WorkflowSpec;
  status: WorkflowStatus;
}

interface WorkflowSpec {
  arguments: WorkflowSpecArguments;
}

interface WorkflowSpecArguments {
  parameters: WorkflowSpecParameter[];
}

interface WorkflowSpecParameter {
  name: string;
  value: string;
}

interface WorkflowStatus {
  startedAt: string;
  finishedAt?: string;
  phase: string;
  progress: string;
}

export type { Workflow };
