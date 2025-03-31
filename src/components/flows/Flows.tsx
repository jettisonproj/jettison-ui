import { useContext } from "react";
import { Link, useParams } from "react-router";

import { routes } from "src/routes.ts";
import { FlowsContext } from "src/providers/provider.tsx";
import { Content } from "src/components/content/Content.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowsNavHeader } from "src/components/header/NavHeader.tsx";

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
      <Content>
        <>
          <FlowsNavHeader namespace={namespace} />
          <FlowsList namespace={namespace} />
        </>
      </Content>
    </>
  );
}

interface FlowsListProps {
  namespace: string;
}

function FlowsList({ namespace }: FlowsListProps) {
  const flows = useContext(FlowsContext);
  if (flows == null) {
    return <i className="nf nf-fa-spinner" />;
  }

  const namespaceFlows = flows[namespace];

  if (namespaceFlows == null) {
    return (
      <p>
        There are no flows in namespace <strong>{namespace}</strong>. Would you
        like to create one?
      </p>
    );
  }
  return (
    <ul>
      {Object.keys(namespaceFlows)
        .sort()
        .map((flow) => (
          <li key={`${namespace}/${flow}`}>
            <Link to={`${routes.flows}/${namespace}/${flow}`}>{flow}</Link>
          </li>
        ))}
    </ul>
  );
}

class FlowsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { Flows };
