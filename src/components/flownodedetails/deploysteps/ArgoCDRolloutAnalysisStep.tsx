import type { JSX } from "react";
import { useContext, useMemo } from "react";

import styles from "src/components/flownodedetails/deploysteps/ArgoCDCanaryStep.module.css";
import {
  CanaryStepNumber,
  CanaryStepStatus,
} from "src/components/flownodedetails/deploysteps/ArgoCDCanaryStepBase.tsx";
import { ArgoCDPod } from "src/components/flownodedetails/podresources/ArgoCDPodGrid.tsx";
import type { Pod } from "src/data/types/podTypes.ts";
import type { RolloutAnalysisStep } from "src/data/types/rolloutTypes.ts";
import { PodsContext } from "src/providers/provider.tsx";
import { APP_VERSION_LABEL } from "src/utils/resourceUtil.ts";

const JETTISON_APP_LABEL = "jettison-app";
const POD_APP_UNDER_TEST_LABEL = "app-under-test";

interface ArgoCDRolloutAnalysisStepProps {
  rolloutNamespace: string;
  rolloutName: string;
  rolloutVersion: string | undefined;
  rolloutAbort: boolean | undefined;
  lastWorkflowRevision: string | undefined;
  rolloutAnalysisStep: RolloutAnalysisStep;
  stepIndex: number;
  currentStepIndex: number;
  isLastStep: boolean;
  canaryStepDescription: string;
}
function ArgoCDRolloutAnalysisStep({
  rolloutNamespace,
  rolloutName,
  rolloutVersion,
  rolloutAbort,
  lastWorkflowRevision,
  rolloutAnalysisStep,
  stepIndex,
  currentStepIndex,
  isLastStep,
  canaryStepDescription,
}: ArgoCDRolloutAnalysisStepProps): JSX.Element {
  const pods = useContext(PodsContext);

  const namespacePods = useMemo(() => {
    if (pods === null) {
      return null;
    }
    const nsPods = pods.get(rolloutNamespace);
    if (nsPods == null) {
      return undefined;
    }

    return Array.from(nsPods.values());
  }, [pods, rolloutNamespace]);

  return (
    <div className={styles.canaryStep}>
      <CanaryStepStatus
        rolloutAbort={rolloutAbort}
        stepIndex={stepIndex}
        currentStepIndex={currentStepIndex}
        isLastStep={isLastStep}
      />
      <div className={styles.canaryStepContent}>
        <CanaryStepNumber
          rolloutAbort={rolloutAbort}
          stepIndex={stepIndex}
          currentStepIndex={currentStepIndex}
        />
        <div className={styles.canaryStepTitle}>Analysis</div>
        <div className={styles.canaryStepSubText}>{canaryStepDescription}</div>
        {rolloutAnalysisStep.templates.map((analysisTemplateRef) => (
          <ArgoCDRolloutAnalysisPods
            key={analysisTemplateRef.templateName}
            rolloutName={rolloutName}
            rolloutVersion={rolloutVersion}
            lastWorkflowRevision={lastWorkflowRevision}
            templateName={analysisTemplateRef.templateName}
            namespacePods={namespacePods}
          />
        ))}
      </div>
    </div>
  );
}

interface ArgoCDRolloutAnalysisPodsProps {
  rolloutName: string;
  rolloutVersion: string | undefined;
  lastWorkflowRevision: string | undefined;
  templateName: string;
  namespacePods: Pod[] | null | undefined;
}
function ArgoCDRolloutAnalysisPods({
  rolloutName,
  rolloutVersion,
  lastWorkflowRevision,
  templateName,
  namespacePods,
}: ArgoCDRolloutAnalysisPodsProps): JSX.Element {
  const analysisPods = useMemo(() => {
    if (namespacePods == null) {
      return namespacePods;
    }
    return namespacePods.filter((namespacePod) => {
      const { labels } = namespacePod.metadata;
      if (labels == null) {
        return false;
      }

      return (
        labels[JETTISON_APP_LABEL] === rolloutName &&
        labels[POD_APP_UNDER_TEST_LABEL] === rolloutName &&
        labels[APP_VERSION_LABEL] === rolloutVersion
      );
    });
  }, [namespacePods, rolloutName, rolloutVersion]);

  if (analysisPods === null) {
    return (
      <>
        <div className={styles.canaryStepTitle}>{templateName}</div>
        <div className={styles.canaryStepSubText}>Loading...</div>
      </>
    );
  }

  if (analysisPods === undefined) {
    return (
      <>
        <div className={styles.canaryStepTitle}>{templateName}</div>
        <div className={styles.canaryStepSubText}>No pods found</div>
      </>
    );
  }

  return (
    <>
      <div className={styles.canaryStepTitle}>{templateName}</div>
      <ArgoCDAnalysisPodGrid
        analysisPods={analysisPods}
        lastWorkflowRevision={lastWorkflowRevision}
      />
    </>
  );
}

interface ArgoCDAnalysisPodGridProps {
  analysisPods: Pod[];
  lastWorkflowRevision: string | undefined;
}
function ArgoCDAnalysisPodGrid({
  analysisPods,
  lastWorkflowRevision,
}: ArgoCDAnalysisPodGridProps): JSX.Element {
  return (
    <div className={styles.analysisPodGrid}>
      {analysisPods.map((pod) => (
        <ArgoCDPod
          key={pod.metadata.name}
          pod={pod}
          lastWorkflowRevision={lastWorkflowRevision}
        />
      ))}
    </div>
  );
}

export { ArgoCDRolloutAnalysisStep };
