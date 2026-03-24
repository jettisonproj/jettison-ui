import { Link } from "react-router";

import styles from "src/components/flow/history/FlowHistoryItem.module.css";
import { Timestamp } from "src/components/timestamp/Timestamp.tsx";
import { FlowHistoryGrid } from "src/components/flow/history/FlowHistoryGrid.tsx";
import { FlowHistoryStatusBadge } from "src/components/flow/history/FlowHistoryStatusBadge.tsx";
import { SelectedHistoryItem } from "src/components/flow/history/selected/SelectedHistoryItem.tsx";
import { ElapsedTime } from "src/components/elapsedtime/ElapsedTime.tsx";
import type { Step } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionRef,
  getWorkflowRevisionTitle,
} from "src/utils/workflowUtil.ts";
import { getRepoCommitLink, trimBranchPrefix } from "src/utils/gitUtil.ts";

interface FlowHistoryItemProps {
  isPrFlow: boolean;
  flowSteps: Step[];
  repoOrg: string;
  workflow: Workflow;
  flowBaseUrl: string;
  isSelected: boolean;
  selectedNodeName: string;
}
function FlowHistoryItem({
  isPrFlow,
  flowSteps,
  repoOrg,
  workflow,
  flowBaseUrl,
  isSelected,
  selectedNodeName,
}: FlowHistoryItemProps) {
  const workflowBaseUrl = `${flowBaseUrl}/workflows/${workflow.metadata.name}`;
  return (
    <div className={styles.historyItem}>
      <FlowHistoryTitle isPrFlow={isPrFlow} workflow={workflow} />
      <FlowHistorySubtitle workflow={workflow} />
      <FlowHistoryGrid
        flowSteps={flowSteps}
        workflow={workflow}
        workflowBaseUrl={workflowBaseUrl}
        isSelected={isSelected}
        selectedNodeName={selectedNodeName}
      />
      <FlowHistoryDetails
        repoOrg={repoOrg}
        workflow={workflow}
        flowBaseUrl={flowBaseUrl}
        isSelected={isSelected}
      />
      {isSelected && (
        <SelectedHistoryItem
          flowSteps={flowSteps}
          workflow={workflow}
          workflowBaseUrl={workflowBaseUrl}
        />
      )}
    </div>
  );
}

interface FlowHistoryTitleProps {
  isPrFlow: boolean;
  workflow: Workflow;
}
function FlowHistoryTitle({ isPrFlow, workflow }: FlowHistoryTitleProps) {
  const { parameterMap } = workflow.memo;
  const commit = getWorkflowRevision(parameterMap);
  const repoUrl = getWorkflowRepo(parameterMap);
  const commitLink = getRepoCommitLink(repoUrl, commit);
  const title = getWorkflowRevisionTitle(parameterMap);
  return (
    <div className={styles.historyTitle}>
      <FlowHistoryStatusBadge isPrFlow={isPrFlow} workflow={workflow} />
      <a
        href={commitLink}
        target="_blank"
        rel="noreferrer"
        className={styles.historyTitleText}
      >
        {title}
      </a>
    </div>
  );
}

interface FlowHistoryFieldProps {
  workflow: Workflow;
}

function FlowHistorySubtitle({ workflow }: FlowHistoryFieldProps) {
  return (
    <div className={styles.historySubtitle}>
      <FlowHistoryAuthor workflow={workflow} />
      <FlowHistoryTimestamp workflow={workflow} />
      <FlowHistoryDuration workflow={workflow} />
      <FlowHistoryBranch workflow={workflow} />
    </div>
  );
}

function FlowHistoryAuthor({ workflow }: FlowHistoryFieldProps) {
  const { parameterMap } = workflow.memo;
  const author = getWorkflowRevisionAuthor(parameterMap);
  return (
    <div className={styles.historySubtitleItem}>
      <i className="nf nf-fa-user_o" />
      <span className={styles.historySubtitleText}>{author}</span>
    </div>
  );
}

function FlowHistoryTimestamp({ workflow }: FlowHistoryFieldProps) {
  const { startedAt } = workflow.memo;
  const timestampComponent =
    startedAt == null ? (
      "-"
    ) : (
      <Timestamp date={startedAt} className={styles.historySubtitleText} />
    );
  return (
    <div className={styles.historySubtitleLink}>
      <i className="nf nf-fa-calendar_o" />
      {timestampComponent}
    </div>
  );
}

function FlowHistoryDuration({ workflow }: FlowHistoryFieldProps) {
  const { duration, startedAt } = workflow.memo;
  let durationComponent;
  if (duration != null) {
    durationComponent = duration;
  } else if (startedAt != null) {
    durationComponent = <ElapsedTime startedAt={startedAt} />;
  } else {
    durationComponent = "-";
  }
  return (
    <div className={styles.historySubtitleItem}>
      <i className="nf nf-fa-clock" />
      <span className={styles.historySubtitleText}>{durationComponent}</span>
    </div>
  );
}

function FlowHistoryBranch({ workflow }: FlowHistoryFieldProps) {
  const { parameterMap } = workflow.memo;
  const revisionRef = getWorkflowRevisionRef(parameterMap);
  const branch = trimBranchPrefix(revisionRef);
  return (
    <div className={styles.historySubtitleItem}>
      <i className="nf nf-fa-code_branch" />
      <span className={styles.historySubtitleText}>{branch}</span>
    </div>
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
      <Link to={detailsUrl} className={styles.historySubtitleLink}>
        <i className={detailsIcon} />
        <span className={styles.historySubtitleText}>See Details</span>
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
        href={`/api/v1/namespaces/${namespace}/workflows/${workflow.metadata.name}`}
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

export { FlowHistoryItem };
