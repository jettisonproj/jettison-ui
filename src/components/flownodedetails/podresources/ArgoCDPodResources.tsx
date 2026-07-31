import type { JSX } from "react";

import { ArgoCDPodGrid } from "src/components/flownodedetails/podresources/ArgoCDPodGrid.tsx";
import styles from "src/components/flownodedetails/podresources/ArgoCDPodResources.module.css";
import { ArgoCDResourceLinks } from "src/components/flownodedetails/podresources/ArgoCDResourceLinks.tsx";
import type {
  Application,
  ApplicationStatusResource,
} from "src/data/types/applicationTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";

interface ArgoCDPodResourcesProps {
  step: ArgoCDStep;
  application: Application | undefined;
  rolloutResource: ApplicationStatusResource | null;
  lastWorkflowRevision: string | undefined;
}
function ArgoCDPodResources({
  step,
  application,
  rolloutResource,
  lastWorkflowRevision,
}: ArgoCDPodResourcesProps): JSX.Element {
  return (
    <>
      <h2 className={styles.sectionTitle}>
        <span>Pod Resources</span>
        <ArgoCDResourceLinks
          step={step}
          application={application}
          rolloutResource={rolloutResource}
        />
      </h2>
      <ArgoCDPodGrid
        rolloutResource={rolloutResource}
        lastWorkflowRevision={lastWorkflowRevision}
      />
    </>
  );
}

export { ArgoCDPodResources };
