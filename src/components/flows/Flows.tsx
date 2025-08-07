import { useContext } from "react";
import { Link, useParams } from "react-router";

import { routes } from "src/routes.ts";
import { FlowsContext } from "src/providers/provider.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowsNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import styles from "src/components/flows/Flows.module.css";

function Flows() {
  const { namespace } = useParams();
  if (!namespace) {
    throw new FlowsError(
      `namespace path parameter cannot be empty: namespace=${namespace}`,
    );
  }
  return (
    <>
      <Header />
      <FlowsNavHeader namespace={namespace} />
      <FlowsList namespace={namespace} />
    </>
  );
}

interface FlowsListProps {
  namespace: string;
}

function FlowsList({ namespace }: FlowsListProps) {
  const flows = useContext(FlowsContext);
  if (flows == null) {
    return <LoadIcon />;
  }

  const namespaceFlows = flows.get(namespace);

  if (namespaceFlows == null) {
    return (
      <p>
        There are no flows in namespace <strong>{namespace}</strong>. Would you
        like to create one?
      </p>
    );
  }
  return Array.from(namespaceFlows.keys())
    .sort()
    .map((flow, index) => (
      <FlowRow
        key={`${namespace}/${flow}`}
        isFirst={index === 0}
        namespace={namespace}
        flow={flow}
      />
    ));
}

interface FlowRowProps extends FlowsListProps {
  flow: string;
  isFirst: boolean;
}
function FlowRow({ namespace, flow, isFirst }: FlowRowProps) {
  let flowRowClassName = styles.flowRow;
  if (flowRowClassName == null) {
    throw new FlowsError("Failed to find flowRow style");
  }
  if (isFirst) {
    flowRowClassName += ` ${styles.flowRowFirst}`;
  }
  return (
    <div className={flowRowClassName}>
      <Link
        to={`${routes.flows}/${namespace}/${flow}`}
        className={styles.flowRowLink}
      ></Link>
      {flow}
      <a
        className={styles.manifestLink}
        href={`http://osoriano.com:2846/api/v1/namespaces/${namespace}/flows/${flow}`}
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
