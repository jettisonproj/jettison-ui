import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import styles from "src/components/repos/RepoStatusBadge.module.css";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { WorkflowPhases } from "src/data/types/workflowTypes.ts";

interface RepoStatusBadgeProps {
  workflow: Workflow | null | undefined;
}
function RepoStatusBadge({ workflow }: RepoStatusBadgeProps) {
  if (workflow === null) {
    return <LoadIcon />;
  }
  const workflowPhase = workflow?.status.phase;
  if (workflowPhase == null) {
    return (
      <div className={`${styles.repoStatusBadge} ${styles.repoBadgePending}`}>
        <div className={styles.repoBadgeText}>
          <i className={`nf nf-fa-clock ${styles.repoBadgeIcon}`} />
          {WorkflowPhases.Pending}
        </div>
      </div>
    );
  }

  switch (workflowPhase) {
    case WorkflowPhases.Succeeded:
      return (
        <div className={`${styles.repoStatusBadge} ${styles.repoBadgeSuccess}`}>
          <div className={styles.repoBadgeText}>
            <i className={`nf nf-fa-circle_check ${styles.repoBadgeIcon}`} />
            {workflowPhase}
          </div>
        </div>
      );
    case WorkflowPhases.Error:
      return (
        <div className={`${styles.repoStatusBadge} ${styles.repoBadgeDanger}`}>
          <div className={styles.repoBadgeText}>
            <i className={`nf nf-md-cancel ${styles.repoBadgeIcon}`} />
            {workflowPhase}
          </div>
        </div>
      );
    case WorkflowPhases.Failed:
      return (
        <div className={`${styles.repoStatusBadge} ${styles.repoBadgeDanger}`}>
          <div className={styles.repoBadgeText}>
            <i className={`nf nf-fa-circle_xmark ${styles.repoBadgeIcon}`} />
            {workflowPhase}
          </div>
        </div>
      );
    case WorkflowPhases.Running:
      return (
        <div className={`${styles.repoStatusBadge} ${styles.repoBadgeRunning}`}>
          <div className={styles.repoBadgeText}>
            <LoadIcon className={styles.repoBadgeIcon} />
            {workflowPhase}
          </div>
        </div>
      );
    case WorkflowPhases.Pending:
      return (
        <div className={`${styles.repoStatusBadge} ${styles.repoBadgePending}`}>
          <div className={styles.repoBadgeText}>
            <i className={`nf nf-fa-clock ${styles.repoBadgeIcon}`} />
            {workflowPhase}
          </div>
        </div>
      );
    case WorkflowPhases.Unknown:
      return (
        <div className={`${styles.repoStatusBadge} ${styles.repoBadgePending}`}>
          <div className={styles.repoBadgeText}>
            <i className={`nf nf-md-cancel ${styles.repoBadgeIcon}`} />
            Unknown
          </div>
        </div>
      );
    default:
      workflowPhase satisfies never;
      console.log("unknown repo status workflow phase:");
      console.log(workflowPhase);
      throw new RepoStatusBadgeError("unknown phase for workflow");
  }
}

class RepoStatusBadgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { RepoStatusBadge };
