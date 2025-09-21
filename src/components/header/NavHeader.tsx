import { Fragment } from "react";
import { Link } from "react-router";

import { routes } from "src/routes.ts";
import styles from "src/components/header/NavHeader.module.css";

/* NavHeader is under the Header and provides the navigation path */
interface NavHeaderComponent {
  displayName: string;
  navLink: string;
}

interface NavHeaderProps {
  components: NavHeaderComponent[];
}

function NavHeader({ components }: NavHeaderProps) {
  if (components.length === 0) {
    return null;
  }

  const lastComponent = components.at(-1);
  if (lastComponent == null) {
    // This should be unreachable due to the length check above
    throw new NavHeaderError("unexpected NavHeaderProps components");
  }

  return (
    <h2 className={styles.navHeader}>
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
  return <NavHeader components={components} />;
}

class NavHeaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { HomeNavHeader, ReposNavHeader, FlowsNavHeader };
