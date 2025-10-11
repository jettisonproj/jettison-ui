import styles from "src/components/flow/history/FlowHistory.module.css";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { Timestamp } from "src/components/timestamp/Timestamp.tsx";
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
} from "src/components/flow/workflowNodeUtil.ts";
import {
  getDisplayCommit,
  getRepoCommitLink,
  getRepoPrLink,
} from "src/utils/gitUtil.ts";

interface FlowHistoryProps {
  isPrFlow: boolean;
  repoOrg: string;
  workflows: Workflow[];
}
function FlowHistory({ isPrFlow, repoOrg, workflows }: FlowHistoryProps) {
  if (workflows.length === 0) {
    return <p>No flow history found</p>;
  }

  return (
    <div className={styles.historyItems}>
      {workflows.map((workflow) => (
        <FlowHistoryItem
          key={workflow.metadata.name}
          isPrFlow={isPrFlow}
          repoOrg={repoOrg}
          workflow={workflow}
        />
      ))}
    </div>
  );
}

interface FlowHistoryItemProps {
  isPrFlow: boolean;
  repoOrg: string;
  workflow: Workflow;
}
function FlowHistoryItem({
  isPrFlow,
  repoOrg,
  workflow,
}: FlowHistoryItemProps) {
  return (
    <div className={styles.historyItem}>
      <FlowHistorySidebar isPrFlow={isPrFlow} workflow={workflow} />
      <FlowHistoryContent workflow={workflow} />
      <FlowHistoryDetails repoOrg={repoOrg} workflow={workflow} />
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
  switch (workflow.status.phase) {
    case WorkflowPhase.Succeeded:
      return <i className={`nf nf-fa-check_circle ${styles.successIcon}`} />;
    case WorkflowPhase.Error:
      return <i className={`nf nf-md-cancel ${styles.dangerIcon}`} />;
    case WorkflowPhase.Failed:
      return <i className={`nf nf-fa-warning ${styles.dangerIcon}`} />;
    case WorkflowPhase.Running:
      return <LoadIcon />;
    case WorkflowPhase.Pending:
    case WorkflowPhase.Unknown:
    default:
      return <i className="nf nf-fa-question_circle" />;
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

function FlowHistoryContent({ workflow }: FlowHistoryFieldProps) {
  return (
    <div className={styles.historyContent}>
      <FlowHistoryTitle workflow={workflow} />
      <FlowHistoryGrid workflow={workflow} />
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

function FlowHistoryGrid({ workflow }: FlowHistoryFieldProps) {
  return (
    <div className={styles.historyGrid}>
      {workflow.memo.sortedNodes.map((node) => (
        <FlowHistoryGridItem key={node.displayName} node={node} />
      ))}
    </div>
  );
}

interface FlowHistoryGridItemProps {
  node: WorkflowMemoStatusNode;
}
function FlowHistoryGridItem({ node }: FlowHistoryGridItemProps) {
  let className = styles.historyGridItem;
  if (className == null) {
    throw new FlowHistoryError("empty className: historyGridItem");
  }

  switch (node.phase) {
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
      // todo update
      // return <LoadIcon className={styles.nodeLoadIcon} />;
      break;
    case NodePhase.Pending:
      // todo update
      // return <i className={`nf nf-fa-hourglass ${styles.nodePhaseIcon}`} />;
      break;
    case NodePhase.Skipped:
    case NodePhase.Omitted:
    default:
      // todo update
      // return (
      //   <i className={`nf nf-fa-question_circle ${styles.nodePhaseIcon}`} />
      // );
      break;
  }

  const nodeDuration = node.duration ?? "-";

  return (
    <div className={className} title={node.displayName}>
      <div className={styles.historyGridText}>{nodeDuration}</div>
    </div>
  );
}

interface FlowHistoryDetailsProps {
  repoOrg: string;
  workflow: Workflow;
}
function FlowHistoryDetails({ repoOrg, workflow }: FlowHistoryDetailsProps) {
  // todo add a link to expand this section
  return (
    <div className={styles.historyDetails}>
      <div className={styles.historyDetailsLink}>
        <i className="nf nf-fa-chevron_right" />
        <span className={styles.sidebarText}>See Details</span>
      </div>
      <FlowHistoryActions repoOrg={repoOrg} workflow={workflow} />
    </div>
  );
}

function FlowHistoryActions({ repoOrg, workflow }: FlowHistoryDetailsProps) {
  // The repoOrg and namespace are expected to match
  const namespace = repoOrg;
  return (
    <div>
      <a
        href={`http://osoriano.com:2846/api/v1/namespaces/${namespace}/workflows/${workflow.metadata.name}`}
        target="_blank"
        rel="noreferrer"
        className={styles.linkIcon}
      >
        <i className="nf nf-fa-file_text_o" />
      </a>
      <a
        href={`https://argo.osoriano.com/workflows/${namespace}/${workflow.metadata.name}`}
        target="_blank"
        rel="noreferrer"
        className={styles.linkIcon}
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

export { FlowHistory };
