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
          <a
            className={styles.navMenuItem}
            href={`/api/v1/namespaces/${repoOrg}/flows/${flowName}`}
            target="_blank"
            rel="noreferrer"
          >
            <i className={`nf nf-fa-file_text_o ${styles.navMenuItemIcon}`} />{" "}
            View Flow YAML
          </a>
        </div>
      </div>
    </>
  );
}

export { FlowNavMenu };
