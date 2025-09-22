import { Fragment } from "react";
import { Link, NavLink } from "react-router";

import { routes, pushTriggerRoute, prTriggerRoute } from "src/routes.ts";
import styles from "src/components/header/NavHeader.module.css";

/* NavHeader is under the Header and provides the navigation path */
interface NavHeaderComponent {
  displayName: string;
  navLink: string;
}

interface NavHeaderFilter extends NavHeaderComponent {
  iconClassName: string;
}

interface NavHeaderProps {
  components: NavHeaderComponent[];
  filters?: NavHeaderFilter[];
}

function NavHeader({ components, filters }: NavHeaderProps) {
  if (components.length === 0) {
    return null;
  }

  const lastComponent = components.at(-1);
  if (lastComponent == null) {
    // This should be unreachable due to the length check above
    throw new NavHeaderError("unexpected NavHeaderProps components");
  }

  return (
    <div className={styles.navHeader}>
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
          {filters.map(({ displayName, navLink, iconClassName }) => (
            <NavLink
              key={displayName}
              to={navLink}
              className={({ isActive }) =>
                isActive ? styles.navFilterSelected : styles.navFilterItem
              }
            >
              <i className={iconClassName} />
              {displayName}
            </NavLink>
          ))}
        </div>
      )}
    </div>
  );
}

/* Create individual NavHeaders for the various pages */

/* Home Nav Header */
const homeNavComponent = { displayName: "Home", navLink: routes.home };
function HomeNavHeader() {
  return <NavHeader components={[homeNavComponent]} />;
}

/* Namespaces Nav Header */
const reposNavComponent = { displayName: "Repos", navLink: routes.flows };
function ReposNavHeader() {
  const components = [homeNavComponent, reposNavComponent];
  return <NavHeader components={components} />;
}

/* Flows Nav Header */
function flowsNavComponent(repoOrg: string, repoName: string) {
  return {
    displayName: repoName,
    navLink: `${routes.flows}/${repoOrg}/${repoName}`,
  };
}
interface FlowsNavHeaderProps {
  repoOrg: string;
  repoName: string;
}
function FlowsNavHeader({ repoOrg, repoName }: FlowsNavHeaderProps) {
  const components = [
    homeNavComponent,
    reposNavComponent,
    flowsNavComponent(repoOrg, repoName),
  ];
  const filters = [
    {
      displayName: "Push Flow",
      navLink: `${routes.flows}/${repoOrg}/${repoName}/${pushTriggerRoute}`,
      iconClassName: `nf nf-fa-code ${styles.navFilterPushIcon}`,
    },
    {
      displayName: "PR Flow",
      navLink: `${routes.flows}/${repoOrg}/${repoName}/${prTriggerRoute}`,
      iconClassName: `nf nf-md-source_pull ${styles.navFilterPrIcon}`,
    },
  ];
  return <NavHeader components={components} filters={filters} />;
}

class NavHeaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { HomeNavHeader, ReposNavHeader, FlowsNavHeader };
