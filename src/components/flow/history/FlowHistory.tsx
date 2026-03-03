import type { Workflow } from "src/data/types/workflowTypes.ts";
import type { Step } from "src/data/types/flowTypes.ts";
import styles from "src/components/flow/history/FlowHistory.module.css";
import { FlowHistoryItem } from "src/components/flow/history/FlowHistoryItem.tsx";

interface FlowHistoryProps {
  isPrFlow: boolean;
  flowSteps: Step[];
  repoOrg: string;
  workflows: Workflow[];
  flowBaseUrl: string;
  selectedWorkflow?: string;
}
function FlowHistory({
  isPrFlow,
  flowSteps,
  repoOrg,
  workflows,
  flowBaseUrl,
  selectedWorkflow,
}: FlowHistoryProps) {
  if (workflows.length === 0) {
    return <p>No flow history found</p>;
  }

  return (
    <div className={styles.historyItems}>
      {workflows.map((workflow) => (
        <FlowHistoryItem
          key={workflow.metadata.name}
          isPrFlow={isPrFlow}
          flowSteps={flowSteps}
          repoOrg={repoOrg}
          workflow={workflow}
          flowBaseUrl={flowBaseUrl}
          isSelected={workflow.metadata.name === selectedWorkflow}
        />
      ))}
    </div>
  );
}
export { FlowHistory };
