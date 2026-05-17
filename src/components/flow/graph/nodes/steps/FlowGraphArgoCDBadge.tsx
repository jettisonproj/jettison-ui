import { Link } from "react-router";

import styles from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDBadge.module.css";

interface ArgoCDBadgeProps {
  stepDetailsLink: string;
  title?: string;
}

function ArgoCDNotFoundBadge({ stepDetailsLink }: ArgoCDBadgeProps) {
  return (
    <Link className={styles.failingBadge} to={stepDetailsLink}>
      <i className={`nf nf-fa-circle_xmark ${styles.notFoundIcon}`} />
      <div className={styles.notFoundBadgeText}>Resource Not Found</div>
    </Link>
  );
}

function ArgoCDFailingBadge({ stepDetailsLink, title }: ArgoCDBadgeProps) {
  return (
    <Link className={styles.failingBadge} to={stepDetailsLink} title={title}>
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.failingDotIcon}></div>
      <div className={styles.badgeText}>Failing</div>
    </Link>
  );
}

function ArgoCDLiveBadge({ stepDetailsLink }: ArgoCDBadgeProps) {
  return (
    <Link to={stepDetailsLink} className={styles.liveBadge}>
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.liveDotIcon}></div>
      <div className={styles.badgeText}>Healthy</div>
    </Link>
  );
}

function ArgoCDPausedBadge({ stepDetailsLink, title }: ArgoCDBadgeProps) {
  return (
    <Link to={stepDetailsLink} className={styles.pausedBadge} title={title}>
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.pausedDotIcon}></div>
      <div className={styles.badgeText}>Paused</div>
    </Link>
  );
}

function ArgoCDDriftBadge({ stepDetailsLink, title }: ArgoCDBadgeProps) {
  return (
    <Link to={stepDetailsLink} className={styles.driftBadge} title={title}>
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.driftDotIcon}></div>
      <div className={styles.badgeText}>Resource Drifted</div>
    </Link>
  );
}

export {
  ArgoCDDriftBadge,
  ArgoCDFailingBadge,
  ArgoCDLiveBadge,
  ArgoCDNotFoundBadge,
  ArgoCDPausedBadge,
};
