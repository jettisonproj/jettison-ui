import type { JSX } from "react";

import styles from "src/components/header/NavMenu.module.css";

const FLOW_NAV_HEADER_POPOVER_ID = "flowNavHeaderPopoverId";

interface FlowNavMenuProps {
  repoOrg: string;
  repoName: string;
  flowName?: string;
}
function FlowNavMenu({
  repoOrg,
  repoName,
  flowName,
}: FlowNavMenuProps): JSX.Element {
  if (flowName == null) {
    return <strong>{repoName}</strong>;
  }
  const navMenuItems = [
    {
      navMenuItemName: "View Flow YAML",
      // The repoOrg and namespace are expected to match
      navMenuItemLink: `/api/v1/namespaces/${repoOrg}/flows/${flowName}`,
      navMenuItemIcon: "nf-fa-file_text_o",
    },
  ];
  return (
    <>
      <button
        popoverTarget={FLOW_NAV_HEADER_POPOVER_ID}
        className={styles.navMenuTitle}
      >
        <strong>
          {repoName} &nbsp;
          <i className={`nf nf-cod-chevron_down ${styles.navMenuIcon}`} />
        </strong>
      </button>
      <div
        id={FLOW_NAV_HEADER_POPOVER_ID}
        className={styles.navMenu}
        popover="auto"
      >
        <div className={styles.navMenuItems}>
          {navMenuItems.map(
            ({ navMenuItemName, navMenuItemLink, navMenuItemIcon }) => (
              <a
                key={navMenuItemName}
                className={styles.navMenuItem}
                href={navMenuItemLink}
                target="_blank"
                rel="noreferrer"
              >
                <i
                  className={`nf ${navMenuItemIcon} ${styles.navMenuItemIcon}`}
                />{" "}
                {navMenuItemName}
              </a>
            ),
          )}
        </div>
      </div>
    </>
  );
}

export { FlowNavMenu };
