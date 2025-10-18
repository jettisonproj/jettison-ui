import { ReactNode } from "react";
import { Link } from "react-router";

import styles from "src/components/flow/history/workflow/nodes/WorkflowGraphNode.module.css";

/**
 * Returns the html content for the WorkflowGraphNode.
 * This gets rendered inside of an svg
 */
interface WorkflowGraphNodeProps {
  headerLink: string;
  titleIcon: string;
  titleText: string;
  children: ReactNode;
}
function WorkflowGraphNode({
  headerLink,
  titleIcon,
  titleText,
  children,
}: WorkflowGraphNodeProps) {
  return (
    <div
      // @ts-expect-error Since this is the root html element inside the svg, xmlns
      // should be set. However, this is not supported in ts currently
      // See https://stackoverflow.com/questions/39504988/react-svg-html-inside-foreignobject-not-rendered
      xmlns="http://www.w3.org/1999/xhtml"
    >
      <Link to={headerLink} className={styles.nodeRowHeader}>
        <i className={titleIcon}></i>
        <span className={styles.nodeTitle}>{titleText}</span>
      </Link>
      {children}
    </div>
  );
}

export { WorkflowGraphNode };
