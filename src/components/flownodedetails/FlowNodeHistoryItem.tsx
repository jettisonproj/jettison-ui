import styles from "src/components/flow/history/FlowHistoryItem.module.css";
import {
  FlowHistoryDetails,
  FlowHistorySubtitle,
  FlowHistoryTitle,
} from "src/components/flow/history/FlowHistoryItem.tsx";
import { FlowNodeSelectedHistoryItem } from "src/components/flownodedetails/FlowNodeSelectedHistoryItem.tsx";
import type { Workflow } from "src/data/types/workflowTypes.ts";

interface FlowNodeHistoryItemProps {
  isPrFlow: boolean;
  flowNodeBaseUrl: string;
  repoOrg: string;
  workflow: Workflow;
  isSelected: boolean;
  nodeName: string;
}
function FlowNodeHistoryItem({
  isPrFlow,
  flowNodeBaseUrl,
  repoOrg,
  workflow,
  isSelected,
  nodeName,
}: FlowNodeHistoryItemProps) {
  const workflowBaseUrl = `${flowNodeBaseUrl}/workflows/${workflow.metadata.name}`;
  const historyItemClassName = isSelected
    ? styles.historyItemBase
    : styles.historyItem;

  return (
    <div className={historyItemClassName}>
      <FlowHistoryTitle
        isPrFlow={isPrFlow}
        workflow={workflow}
        repoOrg={repoOrg}
        isSelected={isSelected}
      />
      <FlowHistorySubtitle workflow={workflow} />
      <FlowHistoryDetails
        workflow={workflow}
        flowBaseUrl={flowNodeBaseUrl}
        isSelected={isSelected}
      />
      {isSelected && (
        <FlowNodeSelectedHistoryItem
          workflow={workflow}
          workflowBaseUrl={workflowBaseUrl}
          nodeName={nodeName}
        />
      )}
    </div>
  );
}

export { FlowNodeHistoryItem };
