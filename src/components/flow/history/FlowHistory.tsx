import styles from "src/components/flow/history/FlowHistory.module.css";
import { getHumanDuration } from "src/components/flow/history/historyUtil.ts";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { Timestamp } from "src/components/timestamp/Timestamp.tsx";
import type { Workflow } from "src/data/types/workflowTypes.ts";
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
    <table className={styles.historyTable}>
      <thead>
        <tr>
          <th className={styles.historyCellHeader}></th>
          {isPrFlow && <th className={styles.historyCellHeader}>PR</th>}
          <th className={styles.historyCellHeader}>Commit</th>
          <th className={styles.historyCellHeader}>Title</th>
          <th className={styles.historyCellHeader}>Author</th>
          <th className={styles.historyCellHeader}>Started</th>
          <th className={styles.historyCellHeader}>Finished</th>
          <th className={styles.historyCellHeader}>Duration</th>
          <th className={styles.historyCellHeader}>Progress</th>
          <th className={styles.historyCellHeader}></th>
        </tr>
      </thead>
      <tbody>
        {workflows.map((workflow) => (
          <FlowHistoryRow
            key={workflow.metadata.name}
            isPrFlow={isPrFlow}
            repoOrg={repoOrg}
            workflow={workflow}
          />
        ))}
      </tbody>
    </table>
  );
}

interface FlowHistoryRowProps {
  isPrFlow: boolean;
  repoOrg: string;
  workflow: Workflow;
}
function FlowHistoryRow({ isPrFlow, repoOrg, workflow }: FlowHistoryRowProps) {
  return (
    <tr className={styles.historyRow}>
      <td className={styles.historyCell}>
        <FlowHistoryStatus workflow={workflow} />
      </td>
      {isPrFlow && (
        <td className={styles.historyCell}>
          <FlowHistoryPR workflow={workflow} />
        </td>
      )}
      <td className={styles.historyCell}>
        <FlowHistoryCommit workflow={workflow} />
      </td>
      <td className={styles.historyCell}>
        <FlowHistoryTitle workflow={workflow} />
      </td>
      <td className={styles.historyCell}>
        <FlowHistoryAuthor workflow={workflow} />
      </td>
      <td className={styles.historyCell}>
        <Timestamp
          date={workflow.memo.startedAt}
          className={styles.timestamp}
        />
      </td>
      <td className={styles.historyCell}>
        <Timestamp
          date={workflow.memo.finishedAt}
          className={styles.timestamp}
        />
      </td>
      <td className={styles.historyCell}>
        <FlowHistoryDuration workflow={workflow} />
      </td>
      <td className={styles.historyCell}>
        <FlowHistoryProgress workflow={workflow} />
      </td>
      <td className={styles.historyCell}>
        <FlowHistoryActions workflow={workflow} repoOrg={repoOrg} />
      </td>
    </tr>
  );
}

interface FlowHistoryCellProps {
  workflow: Workflow;
}
function FlowHistoryStatus({ workflow }: FlowHistoryCellProps) {
  switch (workflow.status.phase) {
    // todo handle more cases
    // See https://pkg.go.dev/github.com/argoproj/argo-workflows/v3@v3.7.0/pkg/apis/workflow/v1alpha1#WorkflowPhase
    case "Succeeded":
      return <i className={`nf nf-fa-check_circle ${styles.successIcon}`} />;
    case "Error":
      return <i className={`nf nf-md-cancel ${styles.dangerIcon}`} />;
    case "Failed":
      return <i className={`nf nf-fa-warning ${styles.dangerIcon}`} />;
    case "Running":
      return <LoadIcon />;
    default:
      return <i className="nf nf-fa-question_circle" />;
  }
}

function FlowHistoryPR({ workflow }: FlowHistoryCellProps) {
  const { parameterMap } = workflow.memo;
  const repoUrl = getWorkflowRepo(parameterMap);
  const prNumber = getWorkflowRevisionNumber(parameterMap);

  const prLink = getRepoPrLink(repoUrl, prNumber);
  return (
    <a
      className={styles.historyCommit}
      href={prLink}
      target="_blank"
      rel="noreferrer"
    >
      #{prNumber}
    </a>
  );
}

function FlowHistoryCommit({ workflow }: FlowHistoryCellProps) {
  const { parameterMap } = workflow.memo;
  const commit = getWorkflowRevision(parameterMap);
  const repoUrl = getWorkflowRepo(parameterMap);
  const displayCommit = getDisplayCommit(commit);
  const commitLink = getRepoCommitLink(repoUrl, commit);
  return (
    <a
      className={styles.historyCommit}
      href={commitLink}
      target="_blank"
      rel="noreferrer"
    >
      {displayCommit}
    </a>
  );
}

function FlowHistoryTitle({ workflow }: FlowHistoryCellProps) {
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

function FlowHistoryAuthor({ workflow }: FlowHistoryCellProps) {
  const { parameterMap } = workflow.memo;
  const author = getWorkflowRevisionAuthor(parameterMap);
  return author;
}

function FlowHistoryDuration({ workflow }: FlowHistoryCellProps) {
  const { startedAt, finishedAt } = workflow.memo;
  if (finishedAt == null) {
    return <LoadIcon />;
  }

  const durationMs = finishedAt.getTime() - startedAt.getTime();
  return getHumanDuration(durationMs);
}

function FlowHistoryProgress({ workflow }: FlowHistoryCellProps) {
  return workflow.status.progress;
}

interface FlowHistoryActionsProps {
  workflow: Workflow;
  repoOrg: string;
}
function FlowHistoryActions({ workflow, repoOrg }: FlowHistoryActionsProps) {
  // The repoOrg and namespace are expected to match
  const namespace = repoOrg;
  return (
    <>
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
    </>
  );
}

export { FlowHistory };
