import { Link } from "react-router";

import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  getDisplayRepoName,
  getDisplayRepoPath,
  getStepDetailsLink,
} from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import type { ArgoCDStep } from "src/data/types/flowTypes.ts";

interface FlowGraphArgoCDStepProps {
  namespace: string;
  flowName: string;
  step: ArgoCDStep;
}
function FlowGraphArgoCDStep({
  namespace,
  flowName,
  step,
}: FlowGraphArgoCDStepProps) {
  const displayRepoName = getDisplayRepoName(step.repoUrl);
  const displayRepoPath = getDisplayRepoPath(step.repoPath, step.repoPath);
  const stepDetailsLink = getStepDetailsLink(namespace, flowName, step);
  return (
    <FlowGraphNode>
      <Link to={stepDetailsLink} className={styles.nodeLink}>
        <i
          className={`nf nf-dev-argocd ${styles.nodeIcon} ${styles.argoIcon}`}
        ></i>
        <div className={styles.nodeTextLine}>{displayRepoName}</div>
        <div className={styles.nodeTextLineBolder}>{displayRepoPath}</div>
      </Link>
    </FlowGraphNode>
  );
}

export { FlowGraphArgoCDStep };
