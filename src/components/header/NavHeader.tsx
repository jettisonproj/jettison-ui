import { Fragment } from "react";
import { Link } from "react-router";

import { routes } from "src/routes.ts";
import styles from "src/components/header/NavHeader.module.css";

/* NavHeader is under the Header and provides the navigation path */
interface NavHeaderComponent {
  name: string;
  link: string;
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
      {components.slice(0, -1).map(({ link, name }) => (
        <Fragment key={link}>
          <Link to={link} className={styles.component}>
            {name}
          </Link>
          <span className={styles.componentSeparator}>⧸</span>
        </Fragment>
      ))}

      {/* The last component has no link */}
      <strong>{lastComponent.name}</strong>
    </h2>
  );
}

/* Create individual NavHeaders for the various pages */

/* Home Nav Header */
const homeNavComponent = { name: "Home", link: routes.home };
function HomeNavHeader() {
  return <NavHeader components={[homeNavComponent]} />;
}

/* Namespaces Nav Header */
const namespacesNavComponent = { name: "Namespaces", link: routes.flows };
function NamespacesNavHeader() {
  const components = [homeNavComponent, namespacesNavComponent];
  return <NavHeader components={components} />;
}

/* Flows Nav Header */
function flowsNavComponent(namespace: string) {
  return { name: namespace, link: `${routes.flows}/${namespace}` };
}
interface FlowsNavHeaderProps {
  namespace: string;
}
function FlowsNavHeader({ namespace }: FlowsNavHeaderProps) {
  const components = [
    homeNavComponent,
    namespacesNavComponent,
    flowsNavComponent(namespace),
  ];
  return <NavHeader components={components} />;
}

/* Flow Nav Header */
function flowNavComponent(namespace: string, name: string) {
  return { name, link: `${routes.flows}/${namespace}/${name}` };
}
interface FlowNavHeaderProps {
  namespace: string;
  name: string;
}
function FlowNavHeader({ namespace, name }: FlowNavHeaderProps) {
  const components = [
    homeNavComponent,
    namespacesNavComponent,
    flowsNavComponent(namespace),
    flowNavComponent(namespace, name),
  ];
  return <NavHeader components={components} />;
}

class NavHeaderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { HomeNavHeader, NamespacesNavHeader, FlowsNavHeader, FlowNavHeader };
