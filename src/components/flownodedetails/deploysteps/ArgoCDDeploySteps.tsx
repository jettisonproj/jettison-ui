import type { JSX } from "react";
import { useCallback, useContext, useMemo, useState } from "react";

import { ArgoCDCanaryStep } from "src/components/flownodedetails/deploysteps/ArgoCDCanaryStep.tsx";
import styles from "src/components/flownodedetails/deploysteps/ArgoCDDeploySteps.module.css";
import type { ApplicationStatusResource } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import { RolloutsContext } from "src/providers/provider.tsx";

/* This should stay in sync with the CSS constant (--content-width) */
const CONTENT_WIDTH = 880;
// todo worth adding isRolloutInProgress?

interface ArgoCDDeployStepsProps {
  rolloutResource: ApplicationStatusResource | null;
}
function ArgoCDDeploySteps({
  rolloutResource,
}: ArgoCDDeployStepsProps): JSX.Element {
  const rollouts = useContext(RolloutsContext);

  const rollout =
    rolloutResource &&
    rollouts?.get(rolloutResource.namespace)?.get(rolloutResource.name);

  const [showDeployStepsUser, setShowDeployStepsUser] = useState<
    boolean | null
  >(null);

  const showDeploySteps = useMemo(() => {
    if (showDeployStepsUser != null) {
      return showDeployStepsUser;
    }
    if (rollout == null) {
      return false;
    }
    return (
      rollout.status.currentStepIndex <
      rollout.spec.strategy.canary.steps.length
    );
  }, [showDeployStepsUser, rollout]);

  const onDeployStepsClick = useCallback(() => {
    setShowDeployStepsUser((v) => !v);
  }, [setShowDeployStepsUser]);

  const titleIconClass = showDeployStepsUser
    ? "nf nf-fa-chevron_up"
    : "nf nf-fa-chevron_down";
  return (
    <>
      <div className={styles.deployStepsHeader} onClick={onDeployStepsClick}>
        <h2 className={styles.deployStepsTitle}>
          <span>Deployment Steps</span>
          <i className={titleIconClass} />
        </h2>
        <ArgoCDDeployProgress rollout={rollout} />
      </div>
      {showDeploySteps && <ArgoCDDeployStepList rollout={rollout} />}
    </>
  );
}

interface ArgoCDRolloutProps {
  rollout: Rollout | null | undefined;
}
function ArgoCDDeployProgress({ rollout }: ArgoCDRolloutProps): JSX.Element {
  if (rollout == null) {
    return <div className={styles.deployProgressBarSkeleton}></div>;
  }

  const { currentStepIndex } = rollout.status;
  const numSteps = rollout.spec.strategy.canary.steps.length;

  const currentRatio = currentStepIndex / numSteps;
  const currentPercentage = Math.trunc(currentRatio * 100);
  const currentWidth = Math.trunc(
    (CONTENT_WIDTH * currentStepIndex) / numSteps,
  );

  let iconClassName;
  let progressBarClassName;
  if (currentStepIndex < numSteps) {
    iconClassName = `nf nf-fa-circle_notch ${styles.deployProgressIconRunning}`;
    progressBarClassName = styles.deployProgressBarRunning;
  } else {
    iconClassName = `nf nf-fa-circle_check ${styles.deployProgressIconSuccess}`;
    progressBarClassName = styles.deployProgressBarSuccess;
  }
  return (
    <>
      <div className={styles.deployProgressText}>
        <i className={iconClassName} />
        {currentPercentage}% ({currentStepIndex}/{numSteps}) completed
      </div>
      <div className={styles.deployProgressBar}>
        <div
          className={progressBarClassName}
          style={{
            width: `${String(currentWidth)}px`,
          }}
        />
      </div>
    </>
  );
}

function ArgoCDDeployStepList({
  rollout,
}: ArgoCDRolloutProps): JSX.Element | JSX.Element[] {
  if (rollout == null) {
    return (
      <>
        <div className={styles.canaryStepSkeleton}></div>
        <div className={styles.canaryStepSkeleton}></div>
        <div className={styles.canaryStepSkeleton}></div>
        <div className={styles.canaryStepSkeleton}></div>
      </>
    );
  }

  const { steps: canarySteps } = rollout.spec.strategy.canary;
  const { currentStepIndex } = rollout.status;
  return canarySteps.map((canaryStep, i) => (
    <ArgoCDCanaryStep
      key={i}
      canaryStep={canaryStep}
      stepIndex={i}
      currentStepIndex={currentStepIndex}
      isLastStep={i === canarySteps.length - 1}
    />
  ));
}
export { ArgoCDDeploySteps };
