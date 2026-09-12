import type { JSX } from "react";
import { Link } from "react-router";

import styles from "src/components/flow/graph/nodes/steps/FlowGraphArgoCDBadge.module.css";
import { concatOptionalStyle } from "src/utils/styleUtil.ts";

interface ArgoCDBadgeProps {
  className: string;
  stepDetailsLink: string;
  title: string;
  textClassName?: string;
}

function ArgoCDNotFoundBadge({
  className,
  stepDetailsLink,
  title,
  textClassName,
}: ArgoCDBadgeProps): JSX.Element {
  const badgeTextClassName = concatOptionalStyle(
    styles.notFoundBadgeText,
    textClassName,
  );
  return (
    <Link
      className={`${styles.failingBadge} ${className}`}
      to={stepDetailsLink}
      title={title}
    >
      <i className={`nf nf-fa-circle_xmark ${styles.notFoundIcon}`} />
      <div className={badgeTextClassName}>Resource Not Found</div>
    </Link>
  );
}

function ArgoCDFailingBadge({
  className,
  stepDetailsLink,
  title,
  textClassName,
}: ArgoCDBadgeProps): JSX.Element {
  const badgeTextClassName = concatOptionalStyle(
    styles.badgeText,
    textClassName,
  );
  return (
    <Link
      className={`${styles.failingBadge} ${className}`}
      to={stepDetailsLink}
      title={title}
    >
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.failingDotIcon}></div>
      <div className={badgeTextClassName}>Failing</div>
    </Link>
  );
}

interface ArgoCDLiveBadgeProps {
  className: string;
  stepDetailsLink: string;
  textClassName?: string;
}
function ArgoCDLiveBadge({
  className,
  stepDetailsLink,
  textClassName,
}: ArgoCDLiveBadgeProps): JSX.Element {
  const badgeTextClassName = concatOptionalStyle(
    styles.badgeText,
    textClassName,
  );
  return (
    <Link className={`${styles.liveBadge} ${className}`} to={stepDetailsLink}>
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.liveDotIcon}></div>
      <div className={badgeTextClassName}>Healthy</div>
    </Link>
  );
}

function ArgoCDPausedBadge({
  className,
  stepDetailsLink,
  title,
  textClassName,
}: ArgoCDBadgeProps): JSX.Element {
  const badgeTextClassName = concatOptionalStyle(
    styles.badgeText,
    textClassName,
  );
  return (
    <Link
      className={`${styles.pausedBadge} ${className}`}
      to={stepDetailsLink}
      title={title}
    >
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.pausedDotIcon}></div>
      <div className={badgeTextClassName}>Paused</div>
    </Link>
  );
}

function ArgoCDUnknownBadge({
  className,
  stepDetailsLink,
  title,
  textClassName,
}: ArgoCDBadgeProps): JSX.Element {
  const badgeTextClassName = concatOptionalStyle(
    styles.badgeText,
    textClassName,
  );
  return (
    <Link
      className={`${styles.pausedBadge} ${className}`}
      to={stepDetailsLink}
      title={title}
    >
      <i className={`nf nf-fa-question_circle_o ${styles.notFoundIcon}`} />
      <div className={badgeTextClassName}>Unknown</div>
    </Link>
  );
}

function ArgoCDDriftBadge({
  className,
  stepDetailsLink,
  title,
  textClassName,
}: ArgoCDBadgeProps): JSX.Element {
  const badgeTextClassName = concatOptionalStyle(
    styles.badgeText,
    textClassName,
  );
  return (
    <Link
      className={`${styles.driftBadge} ${className}`}
      to={stepDetailsLink}
      title={title}
    >
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.driftDotIcon}></div>
      <div className={badgeTextClassName}>Resource Drifted</div>
    </Link>
  );
}

function ArgoCDDeployingBadge({
  className,
  stepDetailsLink,
  title,
  textClassName,
}: ArgoCDBadgeProps): JSX.Element {
  const badgeTextClassName = concatOptionalStyle(
    styles.badgeText,
    textClassName,
  );
  return (
    <Link
      className={`${styles.deployingBadge} ${className}`}
      to={stepDetailsLink}
      title={title}
    >
      <i className={`nf nf-oct-pulse ${styles.pulseIcon}`} />
      <div className={styles.deployingDotIcon}></div>
      <div className={badgeTextClassName}>Deploying</div>
    </Link>
  );
}

export {
  ArgoCDDeployingBadge,
  ArgoCDDriftBadge,
  ArgoCDFailingBadge,
  ArgoCDLiveBadge,
  ArgoCDNotFoundBadge,
  ArgoCDPausedBadge,
  ArgoCDUnknownBadge,
};
