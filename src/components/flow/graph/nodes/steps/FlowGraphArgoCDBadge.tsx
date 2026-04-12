import styles from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDBadge.module.css";

interface ArgoCDBadgeProps {
  title: string | undefined;
}

function ArgoCDNotFoundBadge() {
  return <div className={styles.notFoundBadge}>Not Found</div>;
}

function ArgoCDFailingBadge({ title }: ArgoCDBadgeProps) {
  return (
    <div className={styles.failingBadge} title={title}>
      <i className={`nf nf-oct-pulse ${styles.livePulseIcon}`} />
      <div className={styles.failingDotIcon}></div>
      <div className={styles.badgeText}>Failing</div>
    </div>
  );
}

function ArgoCDLiveBadge() {
  return (
    <div className={styles.liveBadge}>
      <i className={`nf nf-oct-pulse ${styles.failingPulseIcon}`} />
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
