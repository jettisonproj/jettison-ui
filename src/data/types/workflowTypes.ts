interface Workflow {
  metadata: WorkflowMetadata;
  spec: WorkflowSpec;
  status: WorkflowStatus;
}

interface WorkflowMetadata {
  name: string;
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
  finishedAt: string;
  phase: string;
  progress: string;
}

export type { Workflow };
