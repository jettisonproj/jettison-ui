import { getRouteApi } from "@tanstack/react-router";

const nodeWorkflowRouteApi = getRouteApi(
  "/flows/$repoOrg/$repoName/$triggerRoute/$nodeName/workflows/$selectedWorkflow",
);

import styles from "src/components/flow/history/selected/SelectedHistoryItem.module.css";
import { SelectedHistoryTabs } from "src/components/flow/history/selected/SelectedHistoryTabs.tsx";
import { getSelectedTab } from "src/components/flow/history/selected/selectedHistoryTabData.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { getMemoDisplayName } from "src/providers/resourceEventMemo.ts";

interface FlowNodeSelectedHistoryItemProps {
  workflow: Workflow;
  workflowBaseUrl: string;
  nodeName: string;
}
function FlowNodeSelectedHistoryItem({
  workflow,
  workflowBaseUrl,
  nodeName,
}: FlowNodeSelectedHistoryItemProps) {
  const { tab } = nodeWorkflowRouteApi.useSearch();
  const selectedTab = getSelectedTab(tab ?? null);

  // This component is rendered on the fly, so no need to memoize data for this
  // component. Instead, use the raw data to compute the derived data here.
  const { nodes: workflowNodesMap } = workflow.status;
  const { name: workflowName } = workflow.metadata;
  if (workflowNodesMap == null) {
    return <div>No workload data for {workflowName}</div>;
  }

  // Use memoDisplayName instead of displayName to align with the flow step naming
  const selectedNode = Object.values(workflowNodesMap).find(
    (workflowNode) => nodeName === getMemoDisplayName(workflowNode.displayName),
  );

  return (
    <div className={styles.selectedHistoryItem}>
      <SelectedHistoryTabs
        workflow={workflow}
        selectedNodeName={nodeName}
        selectedNode={selectedNode}
        nodeBaseUrl={workflowBaseUrl}
        selectedTab={selectedTab}
        queryPrefix="?"
      />
    </div>
  );
}

export { FlowNodeSelectedHistoryItem };
