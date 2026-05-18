import { getRouteApi, Link } from "@tanstack/react-router";

const flowWorkflowRouteApi = getRouteApi(
  "/flows/$repoOrg/$repoName/$triggerRoute/workflows/$selectedWorkflow",
);

import { ElapsedTime } from "src/components/elapsedtime/ElapsedTime.tsx";
import styles from "src/components/flow/history/FlowHistoryGrid.module.css";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { flowDefaultStepName } from "src/data/data.ts";
import type { Step } from "src/data/types/flowTypes.ts";
import { StepSources } from "src/data/types/flowTypes.ts";
import type {
  NodePhase,
  Workflow,
  WorkflowMemoStatusNode,
} from "src/data/types/workflowTypes.ts";
import { NodePhases, TemplateNames } from "src/data/types/workflowTypes.ts";
import {
  BUILD_DISPLAY_NAME,
  PUBLISH_DISPLAY_NAME,
} from "src/utils/flowUtil.ts";
import { getDisplayRepoPath } from "src/utils/gitUtil.ts";
import { concatStyles } from "src/utils/styleUtil.ts";
import {
  EXIT_NODE_NAME,
  getMemoResourcePath,
  getMemoTriggerDisplayName,
} from "src/utils/workflowUtil.ts";

interface FlowHistoryGridProps {
  flowSteps: Step[];
  workflow: Workflow;
  isSelected: boolean;
  selectedNodeName: string;
}
function FlowHistoryGrid({
  flowSteps,
  workflow,
  isSelected,
  selectedNodeName,
}: FlowHistoryGridProps) {
  const nodesPendingCreation = flowSteps.filter(
    (flowStep) => workflow.memo.nodes[flowDefaultStepName(flowStep)] == null,
  );

  return (
    <div className={styles.historyGrid}>
      {workflow.memo.sortedNodes
        .filter(
          (node) =>
            node.displayName !== EXIT_NODE_NAME ||
            node.phase === NodePhases.Error ||
            node.phase === NodePhases.Failed,
        )
        .map((node) => (
          <FlowHistoryGridItem
            key={node.displayName}
            nodeTitleName={getNodeTitleName(node)}
            nodeDisplayName={node.displayName}
            nodePhase={node.phase}
            nodeDuration={node.duration}
            nodeStartedAt={node.startedAt}
            isSelected={isSelected && selectedNodeName === node.displayName}
          />
        ))}
      {nodesPendingCreation.map((nodePendingCreation) => (
        <FlowHistoryGridItem
          key={flowDefaultStepName(nodePendingCreation)}
          nodeTitleName={getNodePendingCreationTitleName(nodePendingCreation)}
          nodeDisplayName={flowDefaultStepName(nodePendingCreation)}
          nodePhase={NodePhases.Pending}
          nodeDuration={undefined}
          nodeStartedAt={undefined}
          isSelected={
            isSelected &&
            selectedNodeName === flowDefaultStepName(nodePendingCreation)
          }
        />
      ))}
    </div>
  );
}

function getNodeTitleName(node: WorkflowMemoStatusNode) {
  const { template } = node;
  switch (template) {
    case TemplateNames.GitHubCheckStart: {
      return getMemoTriggerDisplayName(node.parameterMap);
    }
    case TemplateNames.DockerBuildTest: {
      return BUILD_DISPLAY_NAME;
    }
    case TemplateNames.DockerBuildTestPublish: {
      return PUBLISH_DISPLAY_NAME;
    }
    case TemplateNames.ArgoCD: {
      const resourcePath = getMemoResourcePath(node.parameterMap);
      return getDisplayRepoPath(resourcePath, resourcePath);
    }
    case TemplateNames.GitHubCheckComplete: {
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
    case StepSources.DockerBuildTest: {
      return BUILD_DISPLAY_NAME;
    }
    case StepSources.DockerBuildTestPublish: {
      return PUBLISH_DISPLAY_NAME;
    }
    case StepSources.ArgoCD: {
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
  isSelected: boolean;
}
function FlowHistoryGridItem({
  nodeTitleName,
  nodeDisplayName,
  nodePhase,
  nodeDuration,
  nodeStartedAt,
  isSelected,
}: FlowHistoryGridItemProps) {
  const params = flowWorkflowRouteApi.useParams();
  let itemClassName = isSelected
    ? styles.historyGridItemSelected
    : styles.historyGridItem;
  let iconComponent;

  switch (nodePhase) {
    case NodePhases.Succeeded:
      itemClassName = concatStyles(itemClassName, styles.historyGridSuccess);
      iconComponent = (
        <i className={`nf nf-fa-circle_check ${styles.historyGridIcon}`} />
      );
      break;
    case NodePhases.Error:
      itemClassName = concatStyles(itemClassName, styles.historyGridDanger);
      iconComponent = (
        <i className={`nf nf-md-cancel ${styles.historyGridIcon}`} />
      );
      break;
    case NodePhases.Failed:
      itemClassName = concatStyles(itemClassName, styles.historyGridDanger);
      iconComponent = (
        <i className={`nf nf-fa-circle_xmark ${styles.historyGridIcon}`} />
      );
      break;
    case NodePhases.Running:
      itemClassName = concatStyles(itemClassName, styles.historyGridRunning);
      iconComponent = <LoadIcon className={styles.historyGridIcon} />;
      break;
    case NodePhases.Pending:
      itemClassName = concatStyles(itemClassName, styles.historyGridPending);
      iconComponent = (
        <i className={`nf nf-fa-clock ${styles.historyGridIcon}`} />
      );
      break;
    case NodePhases.Skipped:
    case NodePhases.Omitted:
      itemClassName = concatStyles(itemClassName, styles.historyGridPending);
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
      to="/flows/$repoOrg/$repoName/$triggerRoute/workflows/$selectedWorkflow"
      params={params}
      search={(prev) => ({ node: nodeDisplayName, tab: prev.tab })}
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
    if (nodePhase === NodePhases.Running && nodeStartedAt != null) {
      return (
        <span className={styles.historyGridNodeDuration}>
          <ElapsedTime startedAt={nodeStartedAt} />
        </span>
      );
    }
    return null;
  }
  return <span className={styles.historyGridNodeDuration}>{nodeDuration}</span>;
}

class FlowHistoryGridError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistoryGrid };
