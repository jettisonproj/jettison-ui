import styles from "src/components/flow/history/FlowHistoryStatusBadge.module.css";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import type { Workflow, WorkflowPhase } from "src/data/types/workflowTypes.ts";
import { WorkflowPhases } from "src/data/types/workflowTypes.ts";
import {
  getDisplayCommit,
  getRepoCommitLink,
  getRepoPrLink,
} from "src/utils/gitUtil.ts";
import {
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionNumber,
} from "src/utils/workflowUtil.ts";

interface FlowHistoryStatusBadgeProps {
  isPrFlow: boolean;
  workflow: Workflow;
}
function FlowHistoryStatusBadge({
  isPrFlow,
  workflow,
}: FlowHistoryStatusBadgeProps) {
  const { title, href, textClassName } = getStatusLinkData(isPrFlow, workflow);
  return (
    <a
      className={styles.historyStatusBadge}
      href={href}
      target="_blank"
      rel="noreferrer"
    >
      <FlowHistoryStatusIcon workflowPhase={workflow.status.phase} />
      <span className={textClassName}>{title}</span>
    </a>
  );
}

interface FlowHistoryStatusIconProps {
  workflowPhase?: WorkflowPhase;
}

function FlowHistoryStatusIcon({ workflowPhase }: FlowHistoryStatusIconProps) {
  switch (workflowPhase) {
    case WorkflowPhases.Succeeded:
      return <i className={`nf nf-fa-circle_check ${styles.successIcon}`} />;
    case WorkflowPhases.Error:
      return <i className={`nf nf-md-cancel ${styles.dangerIcon}`} />;
    case WorkflowPhases.Failed:
      return <i className={`nf nf-fa-circle_xmark ${styles.dangerIcon}`} />;
    case WorkflowPhases.Running:
      return <LoadIcon className={styles.loadingIcon} />;
    case WorkflowPhases.Unknown:
      return <i className={`nf nf-fa-question_circle_o ${styles.badgeIcon}`} />;
    case WorkflowPhases.Pending:
    case undefined:
      return <i className={`nf nf-fa-clock ${styles.badgeIcon}`} />;
    default:
      workflowPhase satisfies never;
      console.log("unknown workflow phase:");
      console.log(workflowPhase);
      throw new FlowHistoryStatusBadgeError("unknown workflow phase");
  }
}

function getStatusLinkData(isPrFlow: boolean, workflow: Workflow) {
  const { parameterMap } = workflow.memo;

  const repoUrl = getWorkflowRepo(parameterMap);
  if (isPrFlow) {
    const prNumber = getWorkflowRevisionNumber(parameterMap);
    const prLink = getRepoPrLink(repoUrl, prNumber);

    return {
      title: `#${prNumber}`,
      href: prLink,
      textClassName: styles.historyCommitPrText,
    };
  }

  const commit = getWorkflowRevision(parameterMap);
  const displayCommit = getDisplayCommit(commit);
  const commitLink = getRepoCommitLink(repoUrl, commit);

  return {
    title: displayCommit,
    href: commitLink,
    textClassName: styles.historyCommitText,
  };
}

/**
 * This can be used to signal that workflows are pending
 * when they do not exist
 */
function FlowHistoryPendingBadge() {
  return (
    <div className={styles.historyStatusBadge}>
      <FlowHistoryStatusIcon workflowPhase={WorkflowPhases.Pending} />
      <span className={styles.historyCommitText}>Pending</span>
    </div>
  );
}

class FlowHistoryStatusBadgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistoryPendingBadge, FlowHistoryStatusBadge };
