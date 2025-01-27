import { useParams } from "react-router";

import { flowByNamespaceName } from "src/data/data.ts";
import type { Flow } from "src/data/types.ts";
import { Content } from "src/components/content/Content.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowNavHeader } from "src/components/header/NavHeader.tsx";
import { FlowGraph } from "src/components/flow/FlowGraph.tsx";

function Flow() {
  const { namespace, name } = useParams();
  if (namespace == null || name == null) {
    // todo throw more specific error type?
    throw new Error("invalid namespace or name in flow page");
  }

  const flowByName = flowByNamespaceName[namespace] ?? {};
  const flow = flowByName[name];

  return (
    <>
      <Header />
      <Content>
        <FlowNavHeader namespace={namespace} name={name} />
        <FlowItem namespace={namespace} name={name} flow={flow} />
      </Content>
    </>
  );
}

interface FlowItemProps {
  namespace: string;
  name: string;
  flow: Flow | undefined;
}

function FlowItem({ namespace, name, flow }: FlowItemProps) {
  if (flow == null) {
    return (
      <p>
        There is no flow{" "}
        <strong>
          {namespace}/{name}
        </strong>
        . Would you like to create one?
      </p>
    );
  }
  return (
    <>
      <FlowGraph />
      <p>flow history here</p>
    </>
  );
}

export { Flow };
