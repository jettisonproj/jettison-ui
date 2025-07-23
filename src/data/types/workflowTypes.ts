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
  arguments: WorkflowSpecArguments;
}

interface WorkflowSpecArguments {
  parameters: WorkflowSpecParameter[];
}

interface WorkflowSpecParameter {
  name: string;
  value: string;
}

interface WorkflowMemo {
  parameterMap: Record<string, string>;
  startedAt: Date;
  finishedAt?: Date;
}

interface WorkflowStatus {
  startedAt: string;
  finishedAt?: string;
  phase: string;
  progress: string;
}

export type { Workflow };
