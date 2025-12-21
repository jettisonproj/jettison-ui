import { Link } from "react-router";

import styles from "src/components/flow/history/FlowHistoryItem.module.css";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { Timestamp } from "src/components/timestamp/Timestamp.tsx";
import { FlowHistoryWorkflow } from "src/components/flow/history/FlowHistoryWorkflow.tsx";
import type {
  Workflow,
  WorkflowMemoStatusNode,
} from "src/data/types/workflowTypes.ts";
import { NodePhase, WorkflowPhase } from "src/data/types/workflowTypes.ts";
import {
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionNumber,
  getWorkflowRevisionTitle,
} from "src/utils/workflowUtil.ts";
import {
  getDisplayCommit,
  getRepoCommitLink,
  getRepoPrLink,
} from "src/utils/gitUtil.ts";

interface FlowHistoryItemProps {
  isPrFlow: boolean;
  repoOrg: string;
  workflow: Workflow;
  flowBaseUrl: string;
  isSelected: boolean;
}
function FlowHistoryItem({
  isPrFlow,
  repoOrg,
  workflow,
  flowBaseUrl,
  isSelected,
}: FlowHistoryItemProps) {
  const workflowBaseUrl = `${flowBaseUrl}/workflows/${workflow.metadata.name}`;
  return (
    <div className={styles.historyItem}>
      <div>
        <FlowHistorySidebar isPrFlow={isPrFlow} workflow={workflow} />
        <FlowHistoryContent
          workflow={workflow}
          workflowBaseUrl={workflowBaseUrl}
        />
        <FlowHistoryDetails
          repoOrg={repoOrg}
          workflow={workflow}
          flowBaseUrl={flowBaseUrl}
          isSelected={isSelected}
        />
      </div>
      {isSelected && (
        <FlowHistoryWorkflow
          workflow={workflow}
          workflowBaseUrl={workflowBaseUrl}
        />
      )}
    </div>
  );
}

interface FlowHistorySidebarProps {
  isPrFlow: boolean;
  workflow: Workflow;
}
function FlowHistorySidebar({ isPrFlow, workflow }: FlowHistorySidebarProps) {
  return (
    <div className={styles.historySidebar}>
      <div>
        <FlowHistoryStatus workflow={workflow} />
        {isPrFlow && <FlowHistoryPR workflow={workflow} />}
        {!isPrFlow && <FlowHistoryCommit workflow={workflow} />}
      </div>
      <FlowHistoryAuthor workflow={workflow} />
      <FlowHistoryTimestamp workflow={workflow} />
      <FlowHistoryDuration workflow={workflow} />
    </div>
  );
}

interface FlowHistoryFieldProps {
  workflow: Workflow;
}
function FlowHistoryStatus({ workflow }: FlowHistoryFieldProps) {
  const { phase } = workflow.status;
  switch (phase) {
    case WorkflowPhase.Succeeded:
      return <i className={`nf nf-fa-check_circle ${styles.successIcon}`} />;
    case WorkflowPhase.Error:
      return <i className={`nf nf-md-cancel ${styles.dangerIcon}`} />;
    case WorkflowPhase.Failed:
      return <i className={`nf nf-fa-warning ${styles.dangerIcon}`} />;
    case WorkflowPhase.Running:
      return <LoadIcon />;
    case WorkflowPhase.Pending:
      return <i className={`nf nf-fa-hourglass ${styles.statusIcon}`} />;
    case WorkflowPhase.Unknown:
      return <i className={`nf nf-fa-question_circle ${styles.statusIcon}`} />;
    default:
      phase satisfies never;
      console.log("unknown workflow phase:");
      console.log(phase);
      return <i className={`nf nf-fa-question_circle ${styles.statusIcon}`} />;
  }
}

function FlowHistoryPR({ workflow }: FlowHistoryFieldProps) {
  const { parameterMap } = workflow.memo;
  const repoUrl = getWorkflowRepo(parameterMap);
  const prNumber = getWorkflowRevisionNumber(parameterMap);

  const prLink = getRepoPrLink(repoUrl, prNumber);
  return (
    <a
      className={styles.historyCommitText}
      href={prLink}
      target="_blank"
      rel="noreferrer"
    >
      #{prNumber}
    </a>
  );
}

function FlowHistoryCommit({ workflow }: FlowHistoryFieldProps) {
  const { parameterMap } = workflow.memo;
  const commit = getWorkflowRevision(parameterMap);
  const repoUrl = getWorkflowRepo(parameterMap);
  const displayCommit = getDisplayCommit(commit);
  const commitLink = getRepoCommitLink(repoUrl, commit);
  return (
    <a
      className={styles.historyCommitText}
      href={commitLink}
      target="_blank"
      rel="noreferrer"
    >
      {displayCommit}
    </a>
  );
}

function FlowHistoryAuthor({ workflow }: FlowHistoryFieldProps) {
  const { parameterMap } = workflow.memo;
  const author = getWorkflowRevisionAuthor(parameterMap);
  return (
    <div className={styles.sidebarItem}>
      <i className="nf nf-fa-user" />
      <span className={styles.historyAuthorText}>{author}</span>
    </div>
  );
}

function FlowHistoryTimestamp({ workflow }: FlowHistoryFieldProps) {
  return (
    <div className={styles.sidebarItem}>
      <i className="nf nf-fa-clock" />
      <Timestamp
        date={workflow.memo.startedAt}
        className={styles.timestampText}
      />
    </div>
  );
}

function FlowHistoryDuration({ workflow }: FlowHistoryFieldProps) {
  const { duration } = workflow.memo;
  if (duration == null) {
    return null;
  }

  return (
    <div className={styles.sidebarItem}>
      <i className="nf nf-fa-flag_o" />
      <span className={styles.sidebarText}>{duration}</span>
    </div>
  );
}

interface FlowHistoryContentProps {
  workflow: Workflow;
  workflowBaseUrl: string;
}
function FlowHistoryContent({
  workflow,
  workflowBaseUrl,
}: FlowHistoryContentProps) {
  return (
    <div className={styles.historyContent}>
      <FlowHistoryTitle workflow={workflow} />
      <FlowHistoryGrid workflow={workflow} workflowBaseUrl={workflowBaseUrl} />
    </div>
  );
}

function FlowHistoryTitle({ workflow }: FlowHistoryFieldProps) {
  const { parameterMap } = workflow.memo;
  const commit = getWorkflowRevision(parameterMap);
  const repoUrl = getWorkflowRepo(parameterMap);
  const commitLink = getRepoCommitLink(repoUrl, commit);
  const title = getWorkflowRevisionTitle(parameterMap);
  return (
    <a
      className={styles.historyTitle}
      href={commitLink}
      target="_blank"
      rel="noreferrer"
    >
      {title}
    </a>
  );
}

function FlowHistoryGrid({
  workflow,
  workflowBaseUrl,
}: FlowHistoryContentProps) {
  return (
    <div className={styles.historyGrid}>
      {workflow.memo.sortedNodes.map((node) => (
        <FlowHistoryGridItem
          key={node.displayName}
          node={node}
          workflowBaseUrl={workflowBaseUrl}
        />
      ))}
    </div>
  );
}

interface FlowHistoryGridItemProps {
  node: WorkflowMemoStatusNode;
  workflowBaseUrl: string;
}
function FlowHistoryGridItem({
  node,
  workflowBaseUrl,
}: FlowHistoryGridItemProps) {
  let className = styles.historyGridItem;
  if (className == null) {
    throw new FlowHistoryError("empty className: historyGridItem");
  }

  const { phase } = node;
  switch (phase) {
    case NodePhase.Succeeded:
      className += ` ${styles.historyGridSuccess}`;
      break;
    case NodePhase.Error:
      className += ` ${styles.historyGridDanger}`;
      break;
    case NodePhase.Failed:
      className += ` ${styles.historyGridDanger}`;
      break;
    case NodePhase.Running:
      className += ` ${styles.historyGridRunning}`;
      break;
    case NodePhase.Pending:
      className += ` ${styles.historyGridPending}`;
      break;
    case NodePhase.Skipped:
    case NodePhase.Omitted:
      className += ` ${styles.historyGridSkipped}`;
      break;
    default:
      phase satisfies never;
      console.log("unknown node phase:");
      console.log(phase);
      break;
  }

  const nodeDuration = node.duration ?? "-";

  return (
    <Link
      to={`${workflowBaseUrl}?node=${node.displayName}`}
      className={className}
      title={node.displayName}
    >
      <div className={styles.historyGridText}>{nodeDuration}</div>
    </Link>
  );
}

interface FlowHistoryDetailsProps {
  repoOrg: string;
  workflow: Workflow;
  flowBaseUrl: string;
  isSelected: boolean;
}
function FlowHistoryDetails({
  repoOrg,
  workflow,
  flowBaseUrl,
  isSelected,
}: FlowHistoryDetailsProps) {
  let detailsUrl;
  let detailsIcon;
  if (isSelected) {
    detailsUrl = flowBaseUrl;
    detailsIcon = "nf nf-fa-chevron_down";
  } else {
    detailsUrl = `${flowBaseUrl}/workflows/${workflow.metadata.name}`;
    detailsIcon = "nf nf-fa-chevron_right";
  }

  return (
    <div className={styles.historyDetails}>
      <Link to={detailsUrl} className={styles.historyDetailsLink}>
        <i className={detailsIcon} />
        <span className={styles.sidebarText}>See Details</span>
      </Link>
      <FlowHistoryActions repoOrg={repoOrg} workflow={workflow} />
    </div>
  );
}

interface FlowHistoryActionsProps {
  repoOrg: string;
  workflow: Workflow;
}
function FlowHistoryActions({ repoOrg, workflow }: FlowHistoryActionsProps) {
  // The repoOrg and namespace are expected to match
  const namespace = repoOrg;
  return (
    <div>
      <a
        href={`http://osoriano.com:2846/api/v1/namespaces/${namespace}/workflows/${workflow.metadata.name}`}
        target="_blank"
        rel="noreferrer"
        className={styles.actionIcon}
      >
        <i className="nf nf-fa-file_text_o" />
      </a>
      <a
        href={`https://argo.osoriano.com/workflows/${namespace}/${workflow.metadata.name}`}
        target="_blank"
        rel="noreferrer"
        className={styles.actionIcon}
      >
        <i className="nf nf-fa-external_link" />
      </a>
    </div>
  );
}

class FlowHistoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistoryItem };
