import { Fragment, useMemo } from "react";
import { Link } from "@tanstack/react-router";

import styles from "src/components/header/NavHeader.module.css";
import { NavHeaderNotificationBadge } from "src/components/header/NavHeaderNotificationBadge.tsx";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  getTriggerRoute,
  prTriggerRoute,
  pushTriggerRoute,
  routes,
} from "src/routes.ts";
import { getNumActiveWorkflows } from "src/utils/workflowUtil.ts";

/* NavHeader is under the Header and provides the navigation path */
interface NavHeaderComponent {
  displayName: string;
  navLink: string;
}

interface NavHeaderFilter extends NavHeaderComponent {
  iconClassName: string;
  numNotifications: number;
}

interface NavHeaderProps {
  components: NavHeaderComponent[];
  showBorder: boolean;
  filters?: NavHeaderFilter[];
}

function NavHeader({ components, showBorder, filters }: NavHeaderProps) {
  if (components.length === 0) {
    return null;
  }

  const lastComponent = components.at(-1);
  if (lastComponent == null) {
    // This should be unreachable due to the length check above
    throw new NavHeaderError("unexpected NavHeaderProps components");
  }

  const navHeaderClass = showBorder
    ? styles.navHeaderBordered
    : styles.navHeader;
  return (
    <div className={navHeaderClass}>
      <h2>
        {/* The prefix components contain links */}
        {components.slice(0, -1).map(({ displayName, navLink }) => (
          <Fragment key={navLink}>
            <Link to={navLink} className={styles.component}>
              {displayName}
            </Link>
            <span className={styles.componentSeparator}>⧸</span>
          </Fragment>
        ))}

        {/* The last component has no link */}
        <strong>{lastComponent.displayName}</strong>
      </h2>
      {filters && (
        <div className={styles.navFilter}>
          {filters.map(
            ({ displayName, navLink, iconClassName, numNotifications }) => (
              <Link
                key={displayName}
                to={navLink}
                className={styles.navFilterItem}
                activeProps={{ className: styles.navFilterSelected }}
              >
                <i className={iconClassName} />
                {displayName}
                <NavHeaderNotificationBadge
                  numNotifications={numNotifications}
                />
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}

/* Create individual NavHeaders for the various pages */

/* Home Nav Header */
const homeNavComponent = { displayName: "Home", navLink: routes.home };
function HomeNavHeader() {
  return <NavHeader components={[homeNavComponent]} showBorder={true} />;
}

/* Namespaces Nav Header */
const reposNavComponent = { displayName: "Repos", navLink: routes.flows };
function ReposNavHeader() {
  const components = [homeNavComponent, reposNavComponent];
  return <NavHeader components={components} showBorder={false} />;
}

/* Flow Nav Header */
function flowNavComponent(
  repoOrg: string,
  repoName: string,
  isPrFlow: boolean,
) {
  const triggerRoute = getTriggerRoute(isPrFlow);
  return {
    displayName: repoName,
    navLink: `${routes.flows}/${repoOrg}/${repoName}/${triggerRoute}`,
  };
}
interface FlowNavHeaderProps {
  repoOrg: string;
  repoName: string;
  isPrFlow: boolean;
  additionalWorkflows?: Map<string, Workflow>;
}
function FlowNavHeader({
  repoOrg,
  repoName,
  isPrFlow,
  additionalWorkflows,
}: FlowNavHeaderProps) {
  const numNotifications = useMemo(
    () => getNumActiveWorkflows(additionalWorkflows),
    [additionalWorkflows],
  );

  const components = [
    homeNavComponent,
    reposNavComponent,
    flowNavComponent(repoOrg, repoName, isPrFlow),
  ];
  const filters = [
    {
      displayName: "Push Flow",
      navLink: `${routes.flows}/${repoOrg}/${repoName}/${pushTriggerRoute}`,
      iconClassName: `nf nf-fa-code ${styles.navFilterPushIcon}`,
      numNotifications: isPrFlow ? numNotifications : 0,
    },
    {
      displayName: "PR Flow",
      navLink: `${routes.flows}/${repoOrg}/${repoName}/${prTriggerRoute}`,
      iconClassName: `nf nf-md-source_pull ${styles.navFilterPrIcon}`,
      numNotifications: isPrFlow ? 0 : numNotifications,
    },
  ];
  return (
    <NavHeader components={components} showBorder={true} filters={filters} />
  );
}

/* FlowNodeDetails Nav Header */
function nodeDetailsNavComponent(
  repoOrg: string,
  repoName: string,
  isPrFlow: boolean,
  nodeName: string,
) {
  const triggerRoute = getTriggerRoute(isPrFlow);
  return {
    displayName: nodeName,
    navLink: `${routes.flows}/${repoOrg}/${repoName}/${triggerRoute}/${nodeName}`,
  };
}
interface FlowNodeDetailsNavHeaderProps extends FlowNavHeaderProps {
  nodeName: string;
}
function FlowNodeDetailsNavHeader({
  repoOrg,
  repoName,
  isPrFlow,
  nodeName,
}: FlowNodeDetailsNavHeaderProps) {
  const components = [
    homeNavComponent,
    reposNavComponent,
    flowNavComponent(repoOrg, repoName, isPrFlow),
    nodeDetailsNavComponent(repoOrg, repoName, isPrFlow, nodeName),
  ];
  return <NavHeader components={components} showBorder={true} />;
}

class NavHeaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export {
  FlowNavHeader,
  FlowNodeDetailsNavHeader,
  HomeNavHeader,
  ReposNavHeader,
};
