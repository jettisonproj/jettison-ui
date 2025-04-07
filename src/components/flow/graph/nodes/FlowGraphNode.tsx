import { ReactNode } from "react";

import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";

/**
 * Returns the html content for the FlowGraphNode.
 * This gets rendered inside of an svg
 */
interface FlowGraphNodeProps {
  children: ReactNode;
}
function FlowGraphNode({ children }: FlowGraphNodeProps) {
  return (
    <div
      // @ts-expect-error Since this is the root html element inside the svg, xmlns
      // should be set. However, this is not supported in ts currently
      // See https://stackoverflow.com/questions/39504988/react-svg-html-inside-foreignobject-not-rendered
      xmlns="http://www.w3.org/1999/xhtml"
      className={styles.nodeRoot}
    >
      {children}
    </div>
  );
}

export { FlowGraphNode };
