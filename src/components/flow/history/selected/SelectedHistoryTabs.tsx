import { Link } from "react-router";

import type {
  Workflow,
  WorkflowStatusNode,
} from "src/data/types/workflowTypes.ts";
import { Tab } from "src/components/flow/history/selected/selectedHistoryTabData.ts";
import { SelectedHistorySummaryTab } from "src/components/flow/history/selected/SelectedHistorySummaryTab.tsx";
import { SelectedHistoryLogTab } from "src/components/flow/history/selected/SelectedHistoryLogTab.tsx";
import { getWorkflowPodName } from "src/components/flow/history/selected/getWorkflowPodName.ts";
import styles from "src/components/flow/history/selected/SelectedHistoryTabs.module.css";

interface SelectedHistoryTabsProps {
  workflow: Workflow;
  node: WorkflowStatusNode;
  nodeBaseUrl: string;
  selectedTab: Tab;
}
function SelectedHistoryTabs({
  workflow,
  node,
  nodeBaseUrl,
  selectedTab,
}: SelectedHistoryTabsProps) {
  return (
    <div className={styles.selectedHistoryTabs}>
      <SelectedHistoryTabSelector
        nodeBaseUrl={nodeBaseUrl}
        selectedTab={selectedTab}
      />
      <SelectedHistoryTab
        workflow={workflow}
        node={node}
        selectedTab={selectedTab}
      />
    </div>
  );
}

interface SelectedHistoryTabSelectorProps {
  nodeBaseUrl: string;
  selectedTab: Tab;
}
function SelectedHistoryTabSelector({
  nodeBaseUrl,
  selectedTab,
}: SelectedHistoryTabSelectorProps) {
  return (
    <div>
      {Object.values(Tab).map((tab) => {
        let tabClassName = styles.selectedHistoryTab;
        if (tab === selectedTab) {
          tabClassName = `${styles.selectedHistoryTab} ${styles.selectedHistoryActiveTab}`;
        }
        return (
          <Link
            key={tab}
            to={`${nodeBaseUrl}&tab=${tab}`}
            className={tabClassName}
          >
            {tab}
          </Link>
        );
      })}
    </div>
  );
}

interface SelectedHistoryTabProps {
  workflow: Workflow;
  node: WorkflowStatusNode;
  selectedTab: Tab;
}
function SelectedHistoryTab({
  workflow,
  node,
  selectedTab,
}: SelectedHistoryTabProps) {
  switch (selectedTab) {
    case Tab.summary:
      return <SelectedHistorySummaryTab node={node} />;
    case Tab.logs:
      return (
        <SelectedHistoryLogTab
          workflowNamespace={workflow.metadata.namespace}
          podName={getWorkflowPodName(workflow.metadata.name, node)}
          nodePhase={node.phase}
        />
      );
    default:
      selectedTab satisfies never;
      console.log("unknown tab");
      console.log(selectedTab);
      throw new SelectedHistoryTabsError("unexpected tab selected");
  }
}

class SelectedHistoryTabsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { SelectedHistoryTabs };
