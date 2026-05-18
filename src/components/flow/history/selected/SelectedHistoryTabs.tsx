import type { JSX } from "react";
import { lazy, Suspense } from "react";
import { Link } from "react-router";

import { SelectedHistoryArtifactsTab } from "src/components/flow/history/selected/SelectedHistoryArtifactsTab.tsx";
import { SelectedHistorySummaryTab } from "src/components/flow/history/selected/SelectedHistorySummaryTab.tsx";
import styles from "src/components/flow/history/selected/SelectedHistoryTabs.module.css";
import { getWorkflowPodName } from "src/components/flow/history/selected/getWorkflowPodName.ts";
import type { Tab } from "src/components/flow/history/selected/selectedHistoryTabData.ts";
import { Tabs } from "src/components/flow/history/selected/selectedHistoryTabData.ts";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import type {
  Workflow,
  WorkflowStatusNode,
} from "src/data/types/workflowTypes.ts";
import { hasUserDefinedArtifacts } from "src/utils/workflowUtil.ts";

const SelectedHistoryLogTab = lazy(() =>
  import("src/components/flow/history/selected/SelectedHistoryLogTab.tsx").then(
    (module) => ({
      default: module.SelectedHistoryLogTab,
    }),
  ),
);

interface SelectedHistoryTabsProps {
  workflow: Workflow;
  selectedNodeName: string;
  selectedNode?: WorkflowStatusNode;
  nodeBaseUrl: string;
  selectedTab: Tab;
  queryPrefix: string;
}
function SelectedHistoryTabs({
  workflow,
  selectedNodeName,
  selectedNode,
  nodeBaseUrl,
  selectedTab,
  queryPrefix,
}: SelectedHistoryTabsProps): JSX.Element {
  return (
    <div className={styles.selectedHistoryTabs}>
      <SelectedHistoryTabSelector
        selectedNode={selectedNode}
        nodeBaseUrl={nodeBaseUrl}
        selectedTab={selectedTab}
        queryPrefix={queryPrefix}
      />
      <SelectedHistoryTab
        workflow={workflow}
        selectedNodeName={selectedNodeName}
        selectedNode={selectedNode}
        selectedTab={selectedTab}
      />
    </div>
  );
}

interface SelectedHistoryTabSelectorProps {
  selectedNode?: WorkflowStatusNode;
  nodeBaseUrl: string;
  selectedTab: Tab;
  queryPrefix: string;
}
function SelectedHistoryTabSelector({
  selectedNode,
  nodeBaseUrl,
  selectedTab,
  queryPrefix,
}: SelectedHistoryTabSelectorProps): JSX.Element {
  return (
    <div>
      {Object.values(Tabs)
        .filter((tab) => isTabEnabled(tab, selectedNode))
        .map((tab) => {
          const tabClassName =
            tab === selectedTab
              ? styles.selectedHistoryActiveTab
              : styles.selectedHistoryTab;
          return (
            <Link
              key={tab}
              to={`${nodeBaseUrl}${queryPrefix}tab=${tab}`}
              className={tabClassName}
            >
              {tab}
            </Link>
          );
        })}
    </div>
  );
}

function isTabEnabled(tab: Tab, selectedNode?: WorkflowStatusNode): boolean {
  if (tab !== Tabs.artifacts) {
    return true;
  }

  // For artifacts, only show if there are user-defined artifacts
  return hasUserDefinedArtifacts(selectedNode);
}

interface SelectedHistoryTabProps {
  workflow: Workflow;
  selectedNodeName: string;
  selectedNode?: WorkflowStatusNode;
  selectedTab: Tab;
}
function SelectedHistoryTab({
  workflow,
  selectedNodeName,
  selectedNode,
  selectedTab,
}: SelectedHistoryTabProps): JSX.Element {
  if (selectedNode == null) {
    return (
      <div className={styles.historyNodeNotFound}>
        Step <span className={styles.historyNodeName}>{selectedNodeName}</span>{" "}
        not started.
      </div>
    );
  }

  const workflowNamespace = workflow.metadata.namespace;
  switch (selectedTab) {
    case Tabs.summary:
      return <SelectedHistorySummaryTab selectedNode={selectedNode} />;
    case Tabs.logs:
      return (
        <Suspense fallback={<LoadIcon />}>
          <SelectedHistoryLogTab
            workflowNamespace={workflowNamespace}
            podName={getWorkflowPodName(workflow.metadata.name, selectedNode)}
            nodePhase={selectedNode.phase}
          />
        </Suspense>
      );
    case Tabs.artifacts:
      return (
        <SelectedHistoryArtifactsTab
          workflowNamespace={workflowNamespace}
          workflowUid={workflow.metadata.uid}
          selectedNode={selectedNode}
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
