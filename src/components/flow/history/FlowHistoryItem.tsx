import { Link } from "react-router";

import { ElapsedTime } from "src/components/elapsedtime/ElapsedTime.tsx";
import { FlowHistoryGrid } from "src/components/flow/history/FlowHistoryGrid.tsx";
import styles from "src/components/flow/history/FlowHistoryItem.module.css";
import { FlowHistoryStatusBadge } from "src/components/flow/history/FlowHistoryStatusBadge.tsx";
import { getTitleParts } from "src/components/flow/history/getTitleParts.ts";
import { SelectedHistoryItem } from "src/components/flow/history/selected/SelectedHistoryItem.tsx";
import { Timestamp } from "src/components/timestamp/Timestamp.tsx";
import type { Step } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  getRepoAuthorLink,
  getRepoCommitLink,
  getRepoPrLink,
  getRepoTreeLink,
  trimBranchPrefix,
} from "src/utils/gitUtil.ts";
import {
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionRef,
  getWorkflowRevisionTitle,
} from "src/utils/workflowUtil.ts";

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
      <FlowHistoryGrid
        flowSteps={flowSteps}
        workflow={workflow}
        workflowBaseUrl={workflowBaseUrl}
        isSelected={isSelected}
        selectedNodeName={selectedNodeName}
      />
      <FlowHistoryDetails
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
  repoOrg: string;
  isSelected: boolean;
}
function FlowHistoryTitle({
  isPrFlow,
  workflow,
  repoOrg,
  isSelected,
}: FlowHistoryTitleProps) {
  return (
    <div className={styles.historyTitle}>
      <div className={styles.historyTitleHeading}>
        <FlowHistoryStatusBadge isPrFlow={isPrFlow} workflow={workflow} />
        <FlowHistoryMessage isPrFlow={isPrFlow} workflow={workflow} />
      </div>
      <FlowHistoryMenu
        workflow={workflow}
        repoOrg={repoOrg}
        isSelected={isSelected}
      />
    </div>
  );
}

interface FlowHistoryMessageProps {
  isPrFlow: boolean;
  workflow: Workflow;
}
function FlowHistoryMessage({ isPrFlow, workflow }: FlowHistoryMessageProps) {
  const { parameterMap } = workflow.memo;
  const commit = getWorkflowRevision(parameterMap);
  const repoUrl = getWorkflowRepo(parameterMap);
  const commitLink = getRepoCommitLink(repoUrl, commit);
  const title = getWorkflowRevisionTitle(parameterMap);

  if (isPrFlow) {
    // No transformation of pr commit message link
    return (
      <a
        href={commitLink}
        target="_blank"
        rel="noreferrer"
        className={styles.historyTitleText}
      >
        {title}
      </a>
    );
  }

  // For non-pr commit messages, parse the pr number and link to it
  return getTitleParts(title).map(({ titlePart, isPrNumber }, i) => (
    <FlowHistoryTitlePart
      key={i}
      repoUrl={repoUrl}
      titlePart={titlePart}
      commitLink={commitLink}
      isPrNumber={isPrNumber}
    />
  ));
}

interface FlowHistoryTitlePartProps {
  repoUrl: string;
  titlePart: string;
  commitLink: string;
  isPrNumber: boolean;
}
function FlowHistoryTitlePart({
  repoUrl,
  titlePart,
  commitLink,
  isPrNumber,
}: FlowHistoryTitlePartProps) {
  if (isPrNumber) {
    const prNumber = titlePart.substring(1);
    const prLink = getRepoPrLink(repoUrl, prNumber);
    return (
      <a
        href={prLink}
        target="_blank"
        rel="noreferrer"
        className={styles.historyTitlePrText}
      >
        {titlePart}
      </a>
    );
  }
  return (
    <a
      href={commitLink}
      target="_blank"
      rel="noreferrer"
      className={styles.historyTitleText}
    >
      {titlePart}
    </a>
  );
}

interface FlowHistoryMenuProps {
  workflow: Workflow;
  repoOrg: string;
  isSelected: boolean;
}
function FlowHistoryMenu({
  workflow,
  repoOrg,
  isSelected,
}: FlowHistoryMenuProps) {
  const { name: workflowName } = workflow.metadata;
  // The repoOrg and namespace are expected to match
  const namespace = repoOrg;
  const historyMenuIconClassName = isSelected
    ? styles.historyMenuIconSelected
    : styles.historyMenuIcon;
  return (
    <>
      <button
        popoverTarget={workflowName}
        className={`nf nf-fa-ellipsis ${historyMenuIconClassName}`}
      />
      <div id={workflowName} className={styles.historyMenu} popover="auto">
        <div className={styles.historyMenuItems}>
          <a
            className={styles.historyMenuItem}
            href={`/api/v1/namespaces/${namespace}/workflows/${workflowName}`}
            target="_blank"
            rel="noreferrer"
          >
            <i
              className={`nf nf-fa-file_text_o ${styles.historyMenuItemIcon}`}
            />{" "}
            View YAML
          </a>
          <a
            className={styles.historyMenuItem}
            href={`https://argo.osoriano.com/workflows/${namespace}/${workflowName}`}
            target="_blank"
            rel="noreferrer"
          >
            <i
              className={`nf nf-fa-external_link ${styles.historyMenuItemIcon}`}
            />{" "}
            View in Workflow UI
          </a>
        </div>
      </div>
    </>
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
  const repoUrl = getWorkflowRepo(parameterMap);
  const revisionRef = getWorkflowRevisionRef(parameterMap);
  const branch = trimBranchPrefix(revisionRef);
  const authorLink = getRepoAuthorLink(repoUrl, branch, author);
  return (
    <a
      href={authorLink}
      target="_blank"
      rel="noreferrer"
      className={styles.historySubtitleLink}
    >
      <i className="nf nf-fa-user_o" />
      <span className={styles.historySubtitleText}>{author}</span>
    </a>
  );
}

function FlowHistoryTimestamp({ workflow }: FlowHistoryFieldProps) {
  const { duration, startedAt } = workflow.memo;
  if (duration == null || startedAt == null) {
    // Hide if in progress (e.g. FlowHistoryDuration is active)
    return null;
  }
  return (
    <div className={styles.historySubtitleLink}>
      <i className="nf nf-fa-calendar_o" />
      <Timestamp date={startedAt} className={styles.historySubtitleText} />
    </div>
  );
}

function FlowHistoryDuration({ workflow }: FlowHistoryFieldProps) {
  const { duration, startedAt } = workflow.memo;
  return (
    <div className={styles.historySubtitleItem}>
      <i className="nf nf-fa-clock" />
      <span className={styles.historySubtitleText}>
        <FlowHistoryDurationText duration={duration} startedAt={startedAt} />
      </span>
    </div>
  );
}

interface FlowHistoryDurationTextProps {
  duration?: string;
  startedAt?: Date;
}
function FlowHistoryDurationText({
  duration,
  startedAt,
}: FlowHistoryDurationTextProps) {
  if (duration != null) {
    return duration;
  }
  if (startedAt != null) {
    return <ElapsedTime startedAt={startedAt} />;
  }
  return "-";
}

function FlowHistoryBranch({ workflow }: FlowHistoryFieldProps) {
  const { parameterMap } = workflow.memo;
  const revisionRef = getWorkflowRevisionRef(parameterMap);
  const branch = trimBranchPrefix(revisionRef);
  const repoUrl = getWorkflowRepo(parameterMap);
  const branchLink = getRepoTreeLink(repoUrl, branch);
  return (
    <a
      href={branchLink}
      target="_blank"
      rel="noreferrer"
      className={styles.historySubtitleLink}
    >
      <i className="nf nf-fa-code_branch" />
      <span className={styles.historySubtitleText}>{branch}</span>
    </a>
  );
}

interface FlowHistoryDetailsProps {
  workflow: Workflow;
  flowBaseUrl: string;
  isSelected: boolean;
}
function FlowHistoryDetails({
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
    </div>
  );
}

export { FlowHistoryItem };
