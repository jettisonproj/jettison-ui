import { useParams } from "react-router";

import { flowByNamespaceName } from "src/data/data.ts";
import type { Flow } from "src/data/types.ts";
import { Content } from "src/components/content/Content.tsx";
import { Header } from "src/components/header/Header.tsx";
import { FlowNavHeader } from "src/components/header/NavHeader.tsx";
import { FlowGraph } from "src/components/flow/FlowGraph.tsx";
import type { FlowNode, FlowEdge } from "src/components/flow/FlowGraph.tsx";
import styles from "src/components/flow/Flow.module.css";

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
  const flowNodes = getFlowNodes(flow);
  const flowEdges = getFlowEdges(flow);
  return (
    <>
      <FlowGraph flowNodes={flowNodes} flowEdges={flowEdges} />
      <pre>{JSON.stringify(flow, null, 2)}</pre>
      <p>flow history here</p>
    </>
  );
}

function getFlowNodes(flow: Flow): FlowNode[] {
  const { triggers } = flow.spec;
  if (triggers.length !== 1) {
    // todo improve err
    throw new Error(
      "error generating FlowGraph: Flow is expected to have 1 trigger",
    );
  }
  const trigger = triggers[0];
  const triggerNode = {
    label: trigger.triggerName ?? trigger.triggerSource,
    width: 144,
    height: 100,
    children: <FlowNodeContent />,
  };

  const { steps } = flow.spec;
  const stepNodes = steps.map((step) => ({
    label: step.stepName ?? step.stepSource,
    width: 168,
    height: 100,
    children: <FlowNodeContent />,
  }));

  return [triggerNode].concat(stepNodes);
}

// todo improve flow defaults
function getFlowEdges(flow: Flow): FlowEdge[] {
  const { triggers, steps } = flow.spec;
  if (triggers.length !== 1) {
    // todo improve err
    throw new Error(
      "error generating FlowGraph: Flow is expected to have 1 trigger",
    );
  }
  const trigger = triggers[0];
  let edgeIndex = 0;
  const triggerEdges = steps
    .filter((step) => !step.dependsOn || step.dependsOn.length === 0)
    .map((step) => ({
      label: `e${++edgeIndex}`,
      v: trigger.triggerName ?? trigger.triggerSource,
      w: step.stepName ?? step.stepSource,
    }));

  const nodeEdges = steps.flatMap((step) =>
    (step.dependsOn ?? []).map((dep) => ({
      label: `e${++edgeIndex}`,
      v: dep,
      w: step.stepName ?? step.stepSource,
    })),
  );

  return triggerEdges.concat(nodeEdges);
}

/**
 * Returns the html content for the FlowNode.
 * This gets rendered inside of an svg
 */
function FlowNodeContent() {
  return (
    <div
      // @ts-expect-error Since this is the root html element inside the svg, xmlns
      // should be set. However, this is not supported in ts currently
      // See https://stackoverflow.com/questions/39504988/react-svg-html-inside-foreignobject-not-rendered
      xmlns="http://www.w3.org/1999/xhtml"
      className={styles.nodeContent}
    >
      <i className="fa fa-user-o"></i> User
    </div>
  );
}

export { Flow };
