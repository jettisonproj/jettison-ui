import type { JSX } from "react";
import { NavLink } from "react-router";

import styles from "src/components/header/FlowNavFilter.module.css";
import { prTriggerRoute, pushTriggerRoute, routes } from "src/routes.ts";

interface FlowNavFilterProps {
  repoOrg: string;
  repoName: string;
  isPrFlow: boolean;
  numNotifications: number;
}
function FlowNavFilter({
  repoOrg,
  repoName,
  isPrFlow,
  numNotifications,
}: FlowNavFilterProps): JSX.Element {
  return (
    <div className={styles.flowNavFilter}>
      <NavLink
        to={`${routes.flows}/${repoOrg}/${repoName}/${pushTriggerRoute}`}
        className={({ isActive }) =>
          isActive ? styles.flowNavFilterSelected : styles.flowNavFilterItem
        }
      >
        <i className={`nf nf-fa-code ${styles.flowNavFilterPushIcon}`} />
        Push Flow
        <NavHeaderNotificationBadge
          numNotifications={isPrFlow ? numNotifications : 0}
        />
      </NavLink>
      <NavLink
        to={`${routes.flows}/${repoOrg}/${repoName}/${prTriggerRoute}`}
        className={({ isActive }) =>
          isActive ? styles.flowNavFilterSelected : styles.flowNavFilterItem
        }
      >
        <i className={`nf nf-md-source_pull ${styles.flowNavFilterPrIcon}`} />
        PR Flow
        <NavHeaderNotificationBadge
          numNotifications={isPrFlow ? 0 : numNotifications}
        />
      </NavLink>
    </div>
  );
}

interface NavHeaderNotificationBadgeProps {
  numNotifications: number;
}
function NavHeaderNotificationBadge({
  numNotifications,
}: NavHeaderNotificationBadgeProps): JSX.Element | null {
  if (numNotifications <= 0) {
    return null;
  }
  return (
    <span className={styles.navHeaderNotificationBadge}>
      {numNotifications}
    </span>
  );
}

export { FlowNavFilter };
