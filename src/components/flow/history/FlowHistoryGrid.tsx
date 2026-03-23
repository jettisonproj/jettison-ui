import { Link } from "react-router";

import { TemplateName } from "src/data/types/workflowTypes.ts";
import { StepSource } from "src/data/types/flowTypes.ts";
import type { Step } from "src/data/types/flowTypes.ts";
import type {
  Workflow,
  WorkflowMemoStatusNode,
} from "src/data/types/workflowTypes.ts";
import { flowDefaultStepName } from "src/data/data.ts";
import { NodePhase } from "src/data/types/workflowTypes.ts";
import { getDisplayRepoPath } from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import {
  EXIT_NODE_NAME,
  getMemoTriggerDisplayName,
  getMemoResourcePath,
} from "src/utils/workflowUtil.ts";
import {
  BUILD_DISPLAY_NAME,
  PUBLISH_DISPLAY_NAME,
} from "src/utils/flowUtil.ts";
import { ElapsedTime } from "src/components/elapsedtime/ElapsedTime.tsx";
import { concatStyles } from "src/utils/styleUtil.ts";
import styles from "src/components/flow/history/FlowHistoryGrid.module.css";

interface FlowHistoryGridProps {
  flowSteps: Step[];
  workflow: Workflow;
  workflowBaseUrl: string;
  isSelected: boolean;
  selectedNodeName: string;
}
function FlowHistoryGrid({
  flowSteps,
  workflow,
  workflowBaseUrl,
  isSelected,
  selectedNodeName,
}: FlowHistoryGridProps) {
  const nodesPendingCreation = flowSteps.filter(
    (flowStep) => workflow.memo.nodes[flowDefaultStepName(flowStep)] == null,
  );

  const exitNodePendingCreation = workflow.memo.nodes[EXIT_NODE_NAME] == null;

  return (
    <div className={styles.historyGrid}>
      {workflow.memo.sortedNodes.map((node) => (
        <FlowHistoryGridItem
          key={node.displayName}
          nodeTitleName={getNodeTitleName(node)}
          nodeDisplayName={node.displayName}
          nodePhase={node.phase}
          nodeDuration={node.duration}
          nodeStartedAt={node.startedAt}
          workflowBaseUrl={workflowBaseUrl}
          isSelected={isSelected && selectedNodeName === node.displayName}
        />
      ))}
      {nodesPendingCreation.map((nodePendingCreation) => (
        <FlowHistoryGridItem
          key={flowDefaultStepName(nodePendingCreation)}
          nodeTitleName={getNodePendingCreationTitleName(nodePendingCreation)}
          nodeDisplayName={flowDefaultStepName(nodePendingCreation)}
          nodePhase={NodePhase.Pending}
          nodeDuration={undefined}
          nodeStartedAt={undefined}
          workflowBaseUrl={workflowBaseUrl}
          isSelected={
            isSelected &&
            selectedNodeName === flowDefaultStepName(nodePendingCreation)
          }
        />
      ))}
      {exitNodePendingCreation && (
        <FlowHistoryGridItem
          key={EXIT_NODE_NAME}
          nodeTitleName={EXIT_NODE_NAME}
          nodeDisplayName={EXIT_NODE_NAME}
          nodePhase={NodePhase.Pending}
          nodeDuration={undefined}
          nodeStartedAt={undefined}
          workflowBaseUrl={workflowBaseUrl}
          isSelected={isSelected && selectedNodeName === EXIT_NODE_NAME}
        />
      )}
    </div>
  );
}

function getNodeTitleName(node: WorkflowMemoStatusNode) {
  const { template } = node.templateRef;
  switch (template) {
    case TemplateName.GitHubCheckStart: {
      return getMemoTriggerDisplayName(node.parameterMap);
    }
    case TemplateName.DockerBuildTest: {
      return BUILD_DISPLAY_NAME;
    }
    case TemplateName.DockerBuildTestPublish: {
      return PUBLISH_DISPLAY_NAME;
    }
    case TemplateName.ArgoCD: {
      const resourcePath = getMemoResourcePath(node.parameterMap);
      return getDisplayRepoPath(resourcePath, resourcePath);
    }
    case TemplateName.GitHubCheckComplete: {
      return EXIT_NODE_NAME;
    }
    default: {
      template satisfies never;
      console.log("invalid template name");
      console.log(template);
      throw new FlowHistoryGridError("invalid template name");
    }
  }
}

function getNodePendingCreationTitleName(nodePendingCreation: Step) {
  switch (nodePendingCreation.stepSource) {
    case StepSource.DockerBuildTest: {
      return BUILD_DISPLAY_NAME;
    }
    case StepSource.DockerBuildTestPublish: {
      return PUBLISH_DISPLAY_NAME;
    }
    case StepSource.ArgoCD: {
      const { repoPath } = nodePendingCreation;
      return getDisplayRepoPath(repoPath, repoPath);
    }
    default: {
      nodePendingCreation satisfies never;
      console.log("invalid step source for node pending creation");
      console.log(nodePendingCreation);
      throw new FlowHistoryGridError(
        "invalid step source for node pending creation",
      );
    }
  }
}

interface FlowHistoryGridItemProps {
  nodeTitleName: string;
  nodeDisplayName: string;
  nodePhase: NodePhase;
  nodeDuration: string | undefined;
  nodeStartedAt: Date | undefined;
  workflowBaseUrl: string;
  isSelected: boolean;
}
function FlowHistoryGridItem({
  nodeTitleName,
  nodeDisplayName,
  nodePhase,
  nodeDuration,
  nodeStartedAt,
  workflowBaseUrl,
  isSelected,
}: FlowHistoryGridItemProps) {
  let itemClassName = concatStyles(
    styles.historyGridItem,
    styles.historyGridItemSelected,
    isSelected,
  );
  let iconComponent;

  switch (nodePhase) {
    case NodePhase.Succeeded:
      itemClassName += ` ${styles.historyGridSuccess}`;
      iconComponent = (
        <i className={`nf nf-fa-circle_check ${styles.historyGridIcon}`} />
      );
      break;
    case NodePhase.Error:
      itemClassName += ` ${styles.historyGridDanger}`;
      iconComponent = (
        <i className={`nf nf-md-cancel ${styles.historyGridIcon}`} />
      );
      break;
    case NodePhase.Failed:
      itemClassName += ` ${styles.historyGridDanger}`;
      iconComponent = (
        <i className={`nf nf-fa-circle_xmark ${styles.historyGridIcon}`} />
      );
      break;
    case NodePhase.Running:
      itemClassName += ` ${styles.historyGridRunning}`;
      iconComponent = <LoadIcon className={styles.historyGridIcon} />;
      break;
    case NodePhase.Pending:
      itemClassName += ` ${styles.historyGridPending}`;
      iconComponent = (
        <i className={`nf nf-fa-clock ${styles.historyGridIcon}`} />
      );
      break;
    case NodePhase.Skipped:
    case NodePhase.Omitted:
      itemClassName += ` ${styles.historyGridPending}`;
      iconComponent = (
        <i className={`nf nf-md-cancel ${styles.historyGridIcon}`} />
      );
      break;
    default:
      nodePhase satisfies never;
      console.log("unknown node phase:");
      console.log(nodePhase);
      throw new FlowHistoryGridError(
        `unknown phase for node: ${nodeDisplayName}`,
      );
  }

  return (
    <Link
      to={`${workflowBaseUrl}?node=${nodeDisplayName}`}
      className={itemClassName}
      title={nodeDisplayName}
    >
      <div className={styles.historyGridText}>
        {iconComponent}
        <span className={styles.historyGridNodeTitle}>{nodeTitleName}</span>
        <NodeDuration
          nodeDuration={nodeDuration}
          nodePhase={nodePhase}
          nodeStartedAt={nodeStartedAt}
        />
      </div>
    </Link>
  );
}

interface NodeDurationProps {
  nodePhase: NodePhase;
  nodeDuration: string | undefined;
  nodeStartedAt: Date | undefined;
}
function NodeDuration({
  nodePhase,
  nodeDuration,
  nodeStartedAt,
}: NodeDurationProps) {
  if (nodeDuration == null) {
    if (nodePhase === NodePhase.Running && nodeStartedAt != null) {
      return <ElapsedTime startedAt={nodeStartedAt} />;
    }
    return "-";
  }
  return nodeDuration;
}

class FlowHistoryGridError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistoryGrid };
