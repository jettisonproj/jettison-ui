import type { JSX } from "react";

import { FlowNodeHistoryItem } from "src/components/flownodedetails/FlowNodeHistoryItem.tsx";
import type { Workflow } from "src/data/types/workflowTypes.ts";

interface FlowNodeHistoryProps {
  isPrFlow: boolean;
  flowNodeBaseUrl: string;
  repoOrg: string;
  workflows: Workflow[];
  selectedWorkflow?: string;
  nodeName: string;
}
function FlowNodeHistory({
  isPrFlow,
  flowNodeBaseUrl,
  repoOrg,
  workflows,
  selectedWorkflow,
  nodeName,
}: FlowNodeHistoryProps): JSX.Element | JSX.Element[] {
  if (workflows.length === 0) {
    return <p>No flow history found</p>;
  }

  return workflows.map((workflow) => (
    <FlowNodeHistoryItem
      key={workflow.metadata.name}
      isPrFlow={isPrFlow}
      flowNodeBaseUrl={flowNodeBaseUrl}
      repoOrg={repoOrg}
      workflow={workflow}
      isSelected={workflow.metadata.name === selectedWorkflow}
      nodeName={nodeName}
    />
  ));
}
export { FlowNodeHistory };
