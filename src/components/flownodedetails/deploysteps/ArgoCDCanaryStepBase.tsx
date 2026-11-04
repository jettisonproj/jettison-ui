import type { JSX } from "react";

import styles from "src/components/flownodedetails/deploysteps/ArgoCDCanaryStepBase.module.css";

interface CanaryStepStatusProps {
  stepIndex: number;
  currentStepIndex: number;
  isLastStep: boolean;
}
function CanaryStepStatus({
  stepIndex,
  currentStepIndex,
  isLastStep,
}: CanaryStepStatusProps): JSX.Element {
  return (
    <div className={styles.canaryStepStatus}>
      <CanaryStepIcon
        stepIndex={stepIndex}
        currentStepIndex={currentStepIndex}
      />
      {!isLastStep && <div className={styles.canaryStepLine} />}
    </div>
  );
}

interface CanaryStepIconProps {
  stepIndex: number;
  currentStepIndex: number;
}
function CanaryStepIcon({
  stepIndex,
  currentStepIndex,
}: CanaryStepIconProps): JSX.Element {
  if (stepIndex === currentStepIndex) {
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
  stepIndex: number;
  currentStepIndex: number;
}
function CanaryStepNumber({
  stepIndex,
  currentStepIndex,
}: CanaryStepNumberProps): JSX.Element {
  const stepNumber = stepIndex + 1;
  if (currentStepIndex === stepIndex) {
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
