import type { JSX } from "react";

import styles from "src/components/flownodedetails/deploysteps/ArgoCDCanaryStep.module.css";
import {
  CanaryStepNumber,
  CanaryStepStatus,
} from "src/components/flownodedetails/deploysteps/ArgoCDCanaryStepBase.tsx";
import type { RolloutAnalysisStep } from "src/data/types/rolloutTypes.ts";

interface ArgoCDRolloutAnalysisStepProps {
  rolloutAnalysisStep: RolloutAnalysisStep;
  stepIndex: number;
  currentStepIndex: number;
  isLastStep: boolean;
  canaryStepDescription: string;
}
function ArgoCDRolloutAnalysisStep({
  rolloutAnalysisStep,
  stepIndex,
  currentStepIndex,
  isLastStep,
  canaryStepDescription,
}: ArgoCDRolloutAnalysisStepProps): JSX.Element {
  // todo more details on the analysis can be shown here
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
          Analysis (
          {rolloutAnalysisStep.templates
            .map((analysisTemplateRef) => analysisTemplateRef.templateName)
            .join(", ")}
          )
        </div>
        <div className={styles.canaryStepSubText}>{canaryStepDescription}</div>
      </div>
    </div>
  );
}

export { ArgoCDRolloutAnalysisStep };
