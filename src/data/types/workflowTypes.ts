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

// These values are not sent by the server, but instead
// computed / derived on the client
interface WorkflowMemo {
  parameterMap: Record<string, string>;
  startedAt: Date;
  finishedAt?: Date;
  nodes: Record<string, WorkflowMemoStatusNode>;
}

interface WorkflowStatus {
  startedAt: string;
  finishedAt?: string;
  phase: string;
  progress: string;
  nodes: Record<string, WorkflowStatusNode>;
}

interface WorkflowStatusNode {
  displayName: string;
  phase: string;
  startedAt: string;
  finishedAt?: string;
  inputs?: WorkflowStatusNodeInputs;
}

interface WorkflowStatusNodeInputs {
  parameters: WorkflowSpecParameter[];
}

interface WorkflowMemoStatusNode {
  displayName: string;
  phase: string;
  startedAt: Date;
  finishedAt?: Date;
  parameterMap: Record<string, string>;
}

export type { Workflow, WorkflowMemoStatusNode };
