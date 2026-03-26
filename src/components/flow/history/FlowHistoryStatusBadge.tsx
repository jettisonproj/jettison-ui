import styles from "src/components/flow/history/FlowHistoryStatusBadge.module.css";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { WorkflowPhases } from "src/data/types/workflowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionNumber,
} from "src/utils/workflowUtil.ts";
import {
  getDisplayCommit,
  getRepoCommitLink,
  getRepoPrLink,
} from "src/utils/gitUtil.ts";

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
      <FlowHistoryStatusIcon workflow={workflow} />
      <span className={textClassName}>{title}</span>
    </a>
  );
}

interface FlowHistoryStatusIconProps {
  workflow: Workflow;
}

function FlowHistoryStatusIcon({ workflow }: FlowHistoryStatusIconProps) {
  const { phase } = workflow.status;
  switch (phase) {
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
      phase satisfies never;
      console.log("unknown workflow phase:");
      console.log(phase);
      throw new FlowHistoryStatusBadgeError("unknown workflow phase");
  }
}

function getStatusLinkData(isPrFlow: boolean, workflow: Workflow) {
  const { parameterMap } = workflow.memo;

  if (isPrFlow) {
    const repoUrl = getWorkflowRepo(parameterMap);
    const prNumber = getWorkflowRevisionNumber(parameterMap);
    const prLink = getRepoPrLink(repoUrl, prNumber);

    return {
      title: `#${prNumber}`,
      href: prLink,
      textClassName: styles.historyCommitPrText,
    };
  }

  const commit = getWorkflowRevision(parameterMap);
  const repoUrl = getWorkflowRepo(parameterMap);
  const displayCommit = getDisplayCommit(commit);
  const commitLink = getRepoCommitLink(repoUrl, commit);

  return {
    title: displayCommit,
    href: commitLink,
    textClassName: styles.historyCommitText,
  };
}

class FlowHistoryStatusBadgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistoryStatusBadge };
