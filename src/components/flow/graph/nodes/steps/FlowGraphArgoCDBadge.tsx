import styles from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDBadge.module.css";

interface ArgoCDBadgeProps {
  title: string | undefined;
}

function ArgoCDNotFoundBadge() {
  return (
    <div className={styles.failingBadge}>
      <i className={`nf nf-fa-circle_xmark ${styles.notFoundIcon}`} />
      <div className={styles.notFoundBadgeText}>Resource Not Found</div>
    </div>
  );
}

function ArgoCDFailingBadge({ title }: ArgoCDBadgeProps) {
  return (
    <div className={styles.failingBadge} title={title}>
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.failingDotIcon}></div>
      <div className={styles.badgeText}>Failing</div>
    </div>
  );
}

function ArgoCDLiveBadge() {
  return (
    <div className={styles.liveBadge}>
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.liveDotIcon}></div>
      <div className={styles.badgeText}>Healthy</div>
    </div>
  );
}

// todo this reuses drift badge?
function ArgoCDPausedBadge({ title }: ArgoCDBadgeProps) {
  return (
    <div className={styles.driftBadge} title={title}>
      Paused
    </div>
  );
}

function ArgoCDDriftBadge({ title }: ArgoCDBadgeProps) {
  return (
    <div className={styles.driftBadge} title={title}>
      Drift
    </div>
  );
}

export {
  ArgoCDDriftBadge,
  ArgoCDFailingBadge,
  ArgoCDLiveBadge,
  ArgoCDNotFoundBadge,
  ArgoCDPausedBadge,
};
