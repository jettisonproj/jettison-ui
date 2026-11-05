import type { JSX } from "react";

import styles from "src/components/flownodedetails/deploysteps/ArgoCDCanaryStepBase.module.css";

interface CanaryStepStatusProps {
  rolloutAbort: boolean | undefined;
  stepIndex: number;
  currentStepIndex: number;
  isLastStep: boolean;
}
function CanaryStepStatus({
  rolloutAbort,
  stepIndex,
  currentStepIndex,
  isLastStep,
}: CanaryStepStatusProps): JSX.Element {
  return (
    <div className={styles.canaryStepStatus}>
      <CanaryStepIcon
        rolloutAbort={rolloutAbort}
        stepIndex={stepIndex}
        currentStepIndex={currentStepIndex}
      />
      {!isLastStep && <div className={styles.canaryStepLine} />}
    </div>
  );
}

interface CanaryStepIconProps {
  rolloutAbort: boolean | undefined;
  stepIndex: number;
  currentStepIndex: number;
}
function CanaryStepIcon({
  rolloutAbort,
  stepIndex,
  currentStepIndex,
}: CanaryStepIconProps): JSX.Element {
  if (stepIndex === currentStepIndex) {
    if (rolloutAbort === true) {
      // The step is aborted
      return (
        <i className={`nf nf-fa-circle_xmark ${styles.canaryStepIconDanger}`} />
      );
    }
    // The step is currently running
    return (
      <i className={`nf nf-fa-circle_notch ${styles.canaryStepIconRunning}`} />
    );
  }
  if (stepIndex > currentStepIndex) {
    // The step has not yet been reached, show as pending
    return (
      <i className={`nf nf-fa-circle_o ${styles.canaryStepIconPending}`} />
    );
  }

  // The step has been completed, show as successful
  return (
    <i className={`nf nf-fa-circle_check ${styles.canaryStepIconSuccess}`} />
  );
}

interface CanaryStepNumberProps {
  rolloutAbort: boolean | undefined;
  stepIndex: number;
  currentStepIndex: number;
}
function CanaryStepNumber({
  rolloutAbort,
  stepIndex,
  currentStepIndex,
}: CanaryStepNumberProps): JSX.Element {
  const stepNumber = stepIndex + 1;
  if (currentStepIndex === stepIndex) {
    if (rolloutAbort === true) {
      // The step is aborted
      return (
        <div className={styles.canaryStepNumberDanger}>Step {stepNumber}</div>
      );
    }
    // The step is currently running
    return (
      <div className={styles.canaryStepNumberRunning}>Step {stepNumber}</div>
    );
  }
  if (stepIndex > currentStepIndex) {
    // The step has not yet been reached, show as pending
    return <div className={styles.canaryStepNumber}>Step {stepNumber}</div>;
  }

  // The step has been completed, show as successful
  return (
    <div className={styles.canaryStepNumberSuccess}>Step {stepNumber}</div>
  );
}

export { CanaryStepNumber, CanaryStepStatus };
