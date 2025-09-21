import { useContext } from "react";
import { Link, useParams } from "react-router";

import { localState } from "src/localState.ts";
import { routes } from "src/routes.ts";
import { FlowsContext } from "src/providers/provider.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowsNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import styles from "src/components/flows/Flows.module.css";

function Flows() {
  const { repoOrg, repoName } = useParams();
  if (!repoOrg || !repoName) {
    throw new FlowsError(
      "repoOrg or repoName path parameter cannot be empty: " +
        `repoOrg=${repoOrg} repoName=${repoName}`,
    );
  }
  return (
    <>
      <Header />
      <FlowsNavHeader repoOrg={repoOrg} repoName={repoName} />
      <FlowsList repoOrg={repoOrg} repoName={repoName} />
    </>
  );
}

interface FlowsListProps {
  repoOrg: string;
  repoName: string;
}

function FlowsList({ repoOrg, repoName }: FlowsListProps) {
  const flows = useContext(FlowsContext);
  if (flows == null) {
    return <LoadIcon />;
  }

  const repoFlows = flows.get(`${repoOrg}/${repoName}`);

  if (repoFlows == null) {
    localState.deleteRecentRepo(repoOrg, repoName);
    return (
      <p>
        There are no flows in repo{" "}
        <strong>
          {repoOrg}/{repoName}
        </strong>
        . Would you like to create one?
      </p>
    );
  }
  localState.addRecentRepo(repoOrg, repoName);

  return Array.from(repoFlows.keys())
    .sort()
    .map((flowName, index) => (
      <FlowRow
        key={`${repoOrg}/${repoName}/${flowName}`}
        isFirst={index === 0}
        repoOrg={repoOrg}
        repoName={repoName}
        flowName={flowName}
      />
    ));
}

interface FlowRowProps extends FlowsListProps {
  flowName: string;
  isFirst: boolean;
}
function FlowRow({ repoOrg, repoName, flowName, isFirst }: FlowRowProps) {
  let flowRowClassName = styles.flowRow;
  if (flowRowClassName == null) {
    throw new FlowsError("failed to find flowRow style");
  }
  if (isFirst) {
    flowRowClassName += ` ${styles.flowRowFirst}`;
  }
  // The repoOrg and namespace are expected to match
  const namespace = repoOrg;
  return (
    <div className={flowRowClassName}>
      <Link
        to={`${routes.flows}/${repoOrg}/${repoName}/${flowName}`}
        className={styles.flowRowLink}
      ></Link>
      {flowName}
      <a
        className={styles.manifestLink}
        href={`http://osoriano.com:2846/api/v1/namespaces/${namespace}/flows/${flowName}`}
        target="_blank"
        rel="noreferrer"
      >
        <i className="nf nf-fa-file_text_o" />
      </a>
    </div>
  );
}

class FlowsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { Flows };
