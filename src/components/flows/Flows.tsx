import { Link, useParams } from "react-router";

import { routes } from "src/routes.ts";
import { flowsByNamespace } from "src/data/data.ts";
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
  const flows = flowsByNamespace[namespace] ?? [];

  return (
    <>
      <Header />
      <Content>
        <>
          <FlowsNavHeader namespace={namespace} />
          <FlowsList namespace={namespace} flows={flows} />
        </>
      </Content>
    </>
  );
}

interface FlowsListProps {
  namespace: string;
  flows: string[];
}

function FlowsList({ namespace, flows }: FlowsListProps) {
  if (flows.length === 0) {
    return (
      <p>
        There are no flows in namespace <strong>{namespace}</strong>. Would you
        like to create one?
      </p>
    );
  }
  return (
    <ul>
      {flows.map((flow) => (
        <li key={flow}>
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
