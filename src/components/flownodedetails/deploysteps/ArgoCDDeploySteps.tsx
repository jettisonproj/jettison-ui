import type { JSX } from "react";
import { useCallback, useContext, useMemo, useState } from "react";

import { ArgoCDCanaryStep } from "src/components/flownodedetails/deploysteps/ArgoCDCanaryStep.tsx";
import styles from "src/components/flownodedetails/deploysteps/ArgoCDDeploySteps.module.css";
import type { ApplicationStatusResource } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import { RolloutsContext } from "src/providers/provider.tsx";
import { APP_VERSION_LABEL } from "src/utils/resourceUtil.ts";

/* This should stay in sync with the CSS constant (--content-width) */
const CONTENT_WIDTH = 880;
// todo worth adding isRolloutInProgress?

interface ArgoCDDeployStepsProps {
  rolloutResource: ApplicationStatusResource | null;
  lastWorkflowRevision: string | undefined;
}
function ArgoCDDeploySteps({
  rolloutResource,
  lastWorkflowRevision,
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

  const titleIconClass = showDeploySteps
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
      {showDeploySteps && (
        <ArgoCDDeployStepList
          rollout={rollout}
          lastWorkflowRevision={lastWorkflowRevision}
        />
      )}
    </>
  );
}

interface ArgoCDDeployProgressProps {
  rollout: Rollout | null | undefined;
}
function ArgoCDDeployProgress({
  rollout,
}: ArgoCDDeployProgressProps): JSX.Element {
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
  if (rollout.status.abort === true) {
    iconClassName = `nf nf-fa-circle_xmark ${styles.deployProgressIconDanger}`;
    progressBarClassName = styles.deployProgressBarRunning;
  } else if (currentStepIndex < numSteps) {
    iconClassName = `nf nf-fa-circle_notch ${styles.deployProgressIconRunning}`;
    progressBarClassName = styles.deployProgressBarRunning;
  } else {
    iconClassName = `nf nf-fa-circle_check ${styles.deployProgressIconSuccess}`;
    progressBarClassName = styles.deployProgressBarSuccess;
  }
  // todo allow retry
  // See: https://github.com/argoproj/argo-rollouts/blob/1b5bbd5bdd516e60acf3f93aa6c93a695464fdb3/pkg/kubectl-argo-rollouts/cmd/retry/retry.go#L89
  return (
    <>
      <div className={styles.deployProgressText}>
        <i className={iconClassName} />
        {currentPercentage}% ({currentStepIndex}/{numSteps}) completed
        {rollout.status.abort && " (aborted)"}
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

interface ArgoCDDeployStepListProps {
  rollout: Rollout | null | undefined;
  lastWorkflowRevision: string | undefined;
}
function ArgoCDDeployStepList({
  rollout,
  lastWorkflowRevision,
}: ArgoCDDeployStepListProps): JSX.Element | JSX.Element[] {
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

  const rolloutVersion = rollout.metadata.labels?.[APP_VERSION_LABEL];
  const { namespace: rolloutNamespace, name: rolloutName } = rollout.metadata;
  const { steps: canarySteps } = rollout.spec.strategy.canary;
  const { currentStepIndex } = rollout.status;
  return canarySteps.map((canaryStep, i) => (
    <ArgoCDCanaryStep
      key={i}
      rolloutNamespace={rolloutNamespace}
      rolloutName={rolloutName}
      rolloutVersion={rolloutVersion}
      rolloutAbort={rollout.status.abort}
      lastWorkflowRevision={lastWorkflowRevision}
      canaryStep={canaryStep}
      stepIndex={i}
      currentStepIndex={currentStepIndex}
      isLastStep={i === canarySteps.length - 1}
    />
  ));
}
export { ArgoCDDeploySteps };
