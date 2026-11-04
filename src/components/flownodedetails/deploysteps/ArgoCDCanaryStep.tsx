import type { JSX } from "react";

import styles from "src/components/flownodedetails/deploysteps/ArgoCDCanaryStep.module.css";
import {
  CanaryStepNumber,
  CanaryStepStatus,
} from "src/components/flownodedetails/deploysteps/ArgoCDCanaryStepBase.tsx";
import { ArgoCDRolloutAnalysisStep } from "src/components/flownodedetails/deploysteps/ArgoCDRolloutAnalysisStep.tsx";
import { CANARY_STEP_DESCRIPTIONS } from "src/components/flownodedetails/deploysteps/canaryStepDescriptions.ts";
import type {
  RolloutCanaryStep,
  RolloutPauseStep,
  SetCanaryScaleStep,
} from "src/data/types/rolloutTypes.ts";

interface ArgoCDCanaryStepProps {
  canaryStep: RolloutCanaryStep;
  stepIndex: number;
  currentStepIndex: number;
  isLastStep: boolean;
}
function ArgoCDCanaryStep({
  canaryStep,
  stepIndex,
  currentStepIndex,
  isLastStep,
}: ArgoCDCanaryStepProps): JSX.Element {
  if (canaryStep.pause != null) {
    return (
      <ArgoCDRolloutPauseStep
        pauseStep={canaryStep.pause}
        stepIndex={stepIndex}
        currentStepIndex={currentStepIndex}
        isLastStep={isLastStep}
        canaryStepDescription={CANARY_STEP_DESCRIPTIONS.Pause}
      />
    );
  }

  if (canaryStep.setWeight != null) {
    return (
      <ArgoCDSetWeightStep
        setWeight={canaryStep.setWeight}
        stepIndex={stepIndex}
        currentStepIndex={currentStepIndex}
        isLastStep={isLastStep}
        canaryStepDescription={CANARY_STEP_DESCRIPTIONS.SetWeight}
      />
    );
  }

  if (canaryStep.setCanaryScale != null) {
    return (
      <ArgoCDSetCanaryScaleStep
        setCanaryScaleStep={canaryStep.setCanaryScale}
        stepIndex={stepIndex}
        currentStepIndex={currentStepIndex}
        isLastStep={isLastStep}
        canaryStepDescription={CANARY_STEP_DESCRIPTIONS.SetCanaryScale}
      />
    );
  }

  if (canaryStep.analysis != null) {
    return (
      <ArgoCDRolloutAnalysisStep
        rolloutAnalysisStep={canaryStep.analysis}
        stepIndex={stepIndex}
        currentStepIndex={currentStepIndex}
        isLastStep={isLastStep}
        canaryStepDescription={CANARY_STEP_DESCRIPTIONS.Analysis}
      />
    );
  }

  console.log("invalid rollout canary step");
  console.log(canaryStep);
  throw new ArgoCDCanaryStepError("invalid rollout canary step");
}

interface ArgoCDRolloutPauseStepProps {
  pauseStep: RolloutPauseStep;
  stepIndex: number;
  currentStepIndex: number;
  isLastStep: boolean;
  canaryStepDescription: string;
}
function ArgoCDRolloutPauseStep({
  pauseStep,
  stepIndex,
  currentStepIndex,
  isLastStep,
  canaryStepDescription,
}: ArgoCDRolloutPauseStepProps): JSX.Element {
  return (
    <div className={styles.canaryStep}>
      <CanaryStepStatus
        stepIndex={stepIndex}
        currentStepIndex={currentStepIndex}
        isLastStep={isLastStep}
      />
      <div className={styles.canaryStepContent}>
        <CanaryStepNumber
          stepIndex={stepIndex}
          currentStepIndex={currentStepIndex}
        />
        <div className={styles.canaryStepTitle}>
          Pause ({pauseStep.duration})
        </div>
        <div className={styles.canaryStepSubText}>{canaryStepDescription}</div>
      </div>
    </div>
  );
}

interface ArgoCDSetWeightStepProps {
  setWeight: number;
  stepIndex: number;
  currentStepIndex: number;
  isLastStep: boolean;
  canaryStepDescription: string;
}
function ArgoCDSetWeightStep({
  setWeight,
  stepIndex,
  currentStepIndex,
  isLastStep,
  canaryStepDescription,
}: ArgoCDSetWeightStepProps): JSX.Element {
  return (
    <div className={styles.canaryStep}>
      <CanaryStepStatus
        stepIndex={stepIndex}
        currentStepIndex={currentStepIndex}
        isLastStep={isLastStep}
      />
      <div className={styles.canaryStepContent}>
        <CanaryStepNumber
          stepIndex={stepIndex}
          currentStepIndex={currentStepIndex}
        />
        <div className={styles.canaryStepTitle}>Set Weight ({setWeight}%)</div>
        <div className={styles.canaryStepSubText}>{canaryStepDescription}</div>
      </div>
    </div>
  );
}

interface ArgoCDSetCanaryScaleStepProps {
  setCanaryScaleStep: SetCanaryScaleStep;
  stepIndex: number;
  currentStepIndex: number;
  isLastStep: boolean;
  canaryStepDescription: string;
}
function ArgoCDSetCanaryScaleStep({
  setCanaryScaleStep,
  stepIndex,
  currentStepIndex,
  isLastStep,
  canaryStepDescription,
}: ArgoCDSetCanaryScaleStepProps): JSX.Element {
  return (
    <div className={styles.canaryStep}>
      <CanaryStepStatus
        stepIndex={stepIndex}
        currentStepIndex={currentStepIndex}
        isLastStep={isLastStep}
      />
      <div className={styles.canaryStepContent}>
        <CanaryStepNumber
          stepIndex={stepIndex}
          currentStepIndex={currentStepIndex}
        />
        <div className={styles.canaryStepTitle}>
          Set Canary Scale
          {setCanaryScaleStep.weight != null &&
            ` (${String(setCanaryScaleStep.weight)}%)`}
          {setCanaryScaleStep.matchTrafficWeight != null &&
            " (Match Traffic Weight)"}
        </div>
        <div className={styles.canaryStepSubText}>{canaryStepDescription}</div>
      </div>
    </div>
  );
}

class ArgoCDCanaryStepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { ArgoCDCanaryStep };
