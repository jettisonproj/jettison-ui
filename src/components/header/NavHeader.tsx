import type { JSX } from "react";
import { useMemo } from "react";
import { Link } from "react-router";

import { FlowNavFilter } from "src/components/header/FlowNavFilter.tsx";
import { FlowNavMenu } from "src/components/header/FlowNavMenu.tsx";
import { FlowNodeDetailsNavMenu } from "src/components/header/FlowNodeDetailsNavMenu.tsx";
import styles from "src/components/header/NavHeader.module.css";
import type {
  Application,
  ApplicationStatusResource,
} from "src/data/types/applicationTypes.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { getTriggerRoute, routes } from "src/routes.ts";
import { getNumActiveWorkflows } from "src/utils/workflowUtil.ts";

/* Create NavHeaders for the various pages */

/* Home Nav Header */
function HomeNavHeader(): JSX.Element {
  return (
    <div className={styles.navHeaderBordered}>
      <h2>
        <strong>Home</strong>
      </h2>
    </div>
  );
}

/* Repos Nav Header */
function ReposNavHeader(): JSX.Element {
  return (
    <div className={styles.navHeader}>
      <h2>
        <Link to={routes.home} className={styles.component}>
          Home
        </Link>
        <span className={styles.componentSeparator}>⧸</span>
        <strong>Repos</strong>
      </h2>
    </div>
  );
}

/* Flow Nav Header */
interface FlowNavHeaderProps {
  repoOrg: string;
  repoName: string;
  isPrFlow: boolean;
  additionalWorkflows?: Map<string, Workflow>;
  flowName?: string;
}
function FlowNavHeader({
  repoOrg,
  repoName,
  isPrFlow,
  additionalWorkflows,
  flowName,
}: FlowNavHeaderProps): JSX.Element {
  const numNotifications = useMemo(
    () => getNumActiveWorkflows(additionalWorkflows),
    [additionalWorkflows],
  );

  return (
    <div className={styles.navHeaderBordered}>
      <h2>
        <Link to={routes.home} className={styles.component}>
          Home
        </Link>
        <span className={styles.componentSeparator}>⧸</span>
        <Link to={routes.flows} className={styles.component}>
          Repos
        </Link>
        <span className={styles.componentSeparator}>⧸</span>
        <FlowNavMenu
          repoOrg={repoOrg}
          repoName={repoName}
          flowName={flowName}
        />
      </h2>
      <FlowNavFilter
        repoOrg={repoOrg}
        repoName={repoName}
        isPrFlow={isPrFlow}
        numNotifications={numNotifications}
      />
    </div>
  );
}

interface FlowNodeDetailsNavHeaderProps {
  repoOrg: string;
  repoName: string;
  isPrFlow: boolean;
  nodeName: string;
  step?: ArgoCDStep;
  application?: Application | undefined;
  rolloutResource?: ApplicationStatusResource | null;
}
function FlowNodeDetailsNavHeader({
  repoOrg,
  repoName,
  isPrFlow,
  nodeName,
  step,
  application,
  rolloutResource,
}: FlowNodeDetailsNavHeaderProps): JSX.Element {
  const triggerRoute = getTriggerRoute(isPrFlow);
  return (
    <div className={styles.navHeaderBordered}>
      <h2>
        <Link to={routes.home} className={styles.component}>
          Home
        </Link>
        <span className={styles.componentSeparator}>⧸</span>
        <Link to={routes.flows} className={styles.component}>
          Repos
        </Link>
        <span className={styles.componentSeparator}>⧸</span>
        <Link
          to={`${routes.flows}/${repoOrg}/${repoName}/${triggerRoute}`}
          className={styles.component}
        >
          {repoName}
        </Link>
        <span className={styles.componentSeparator}>⧸</span>
        <FlowNodeDetailsNavMenu
          nodeName={nodeName}
          step={step}
          application={application}
          rolloutResource={rolloutResource}
        />
      </h2>
    </div>
  );
}

export {
  FlowNavHeader,
  FlowNodeDetailsNavHeader,
  HomeNavHeader,
  ReposNavHeader,
};
