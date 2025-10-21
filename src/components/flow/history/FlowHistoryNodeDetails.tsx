import { Fragment } from "react";
import { Link } from "react-router";

import type { WorkflowStatusNode } from "src/data/types/workflowTypes.ts";
import { Tab } from "src/components/flow/history/FlowHistoryNodeTabs.ts";
import { Timestamp } from "src/components/timestamp/Timestamp.tsx";
import styles from "src/components/flow/history/FlowHistoryNodeDetails.module.css";

interface FlowHistoryNodeDetailsProps {
  node: WorkflowStatusNode;
  nodeBaseUrl: string;
  selectedTab: Tab;
}
function FlowHistoryNodeDetails({
  node,
  nodeBaseUrl,
  selectedTab,
}: FlowHistoryNodeDetailsProps) {
  return (
    <div className={styles.historyNodeDetails}>
      <FlowHistoryNodeTabs
        nodeBaseUrl={nodeBaseUrl}
        selectedTab={selectedTab}
      />
      <FlowHistoryNode node={node} selectedTab={selectedTab} />
    </div>
  );
}

interface FlowHistoryNodeTabsProps {
  nodeBaseUrl: string;
  selectedTab: Tab;
}
function FlowHistoryNodeTabs({
  nodeBaseUrl,
  selectedTab,
}: FlowHistoryNodeTabsProps) {
  return (
    <div>
      {Object.values(Tab).map((tab) => {
        let tabClassName = styles.historyNodeTab;
        if (tab === selectedTab) {
          tabClassName = `${styles.historyNodeTab} ${styles.historyNodeActiveTab}`;
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

interface FlowHistoryNodeProps {
  node: WorkflowStatusNode;
  selectedTab: Tab;
}
function FlowHistoryNode({ node, selectedTab }: FlowHistoryNodeProps) {
  switch (selectedTab) {
    case Tab.summary:
      return <FlowHistoryNodeSummary node={node} />;
    case Tab.logs:
      return <div>todo show logs here</div>;
    default:
      selectedTab satisfies never;
      console.log("unknown tab");
      console.log(selectedTab);
      throw new FlowHistoryNodeError("unexpected tab selected");
  }
}

interface FlowHistoryNodeSummaryProps {
  node: WorkflowStatusNode;
}
function FlowHistoryNodeSummary({ node }: FlowHistoryNodeSummaryProps) {
  const startedAt = new Date(node.startedAt);
  return (
    <>
      <div className={styles.nodeSummary}>
        <span className={styles.nodeSummaryKey}>Name</span>
        <span>{node.displayName}</span>
        <span className={styles.nodeSummaryKey}>Template</span>
        <span>{node.templateRef.template}</span>
        <span className={styles.nodeSummaryKey}>Phase</span>
        <span>{node.phase}</span>
        <span className={styles.nodeSummaryKey}>Started At</span>
        <Timestamp className={styles.timestampText} date={startedAt} />
        <span className={styles.nodeSummaryKey}>Finished At</span>
        {node.finishedAt ? (
          <Timestamp
            className={styles.timestampText}
            date={new Date(node.finishedAt)}
          />
        ) : (
          <span>{node.finishedAt}</span>
        )}
      </div>
      <div className={styles.nodeSummaryParameters}>Parameters</div>
      <div className={styles.nodeSummary}>
        {node.inputs?.parameters.map((param) => (
          <Fragment key={param.name}>
            <span className={styles.nodeSummaryKey}>{param.name}</span>
            <span>{param.value}</span>
          </Fragment>
        ))}
      </div>
    </>
  );
}

class FlowHistoryNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistoryNodeDetails };
