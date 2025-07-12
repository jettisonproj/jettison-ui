import { useContext, useMemo } from "react";

import styles from "src/components/flow/history/FlowHistory.module.css";
import { getHumanDuration } from "src/components/flow/history/historyUtil.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { WorkflowsContext } from "src/providers/provider.tsx";
import {
  DisplayIsoTimestampsContext,
  SetDisplayIsoTimestampsContext,
} from "src/providers/provider.tsx";
import {
  getDisplayCommit,
  getRepoCommitLink,
  getRepoPrLink,
} from "src/utils/gitUtil.ts";

interface FlowHistoryProps {
  isPrFlow: boolean;
  namespace: string;
  flowName: string;
}
function FlowHistory({ isPrFlow, namespace, flowName }: FlowHistoryProps) {
  const allWorkflows = useContext(WorkflowsContext);
  if (allWorkflows == null) {
    return <i className="nf nf-fa-spinner" />;
  }
  const workflows = allWorkflows.get(namespace)?.get(flowName);
  if (workflows == null) {
    return <p>No flow history found</p>;
  }

  return (
    <SortedFlowHistory
      isPrFlow={isPrFlow}
      namespace={namespace}
      flowName={flowName}
      workflows={workflows}
    />
  );
}

interface SortedFlowHistoryProps extends FlowHistoryProps {
  workflows: Map<string, Workflow>;
}
function SortedFlowHistory({
  isPrFlow,
  namespace,
  flowName,
  workflows,
}: SortedFlowHistoryProps) {
  const sortedWorkflows = useMemo(
    () =>
      Array.from(workflows.values()).sort((a, b) =>
        b.status.startedAt.localeCompare(a.status.startedAt),
      ),
    [workflows],
  );

  return (
    <table>
      <thead>
        <tr>
          <th></th>
          {isPrFlow && <th>PR</th>}
          <th>Commit</th>
          <th>Started</th>
          <th>Finished</th>
          <th>Duration</th>
          <th>Progress</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {sortedWorkflows.map((workflow) => (
          <FlowHistoryRow
            key={workflow.metadata.name}
            isPrFlow={isPrFlow}
            namespace={namespace}
            flowName={flowName}
            workflow={workflow}
          />
        ))}
      </tbody>
    </table>
  );
}

interface FlowHistoryRowProps extends FlowHistoryProps {
  workflow: Workflow;
}
function FlowHistoryRow({
  isPrFlow,
  namespace,
  flowName,
  workflow,
}: FlowHistoryRowProps) {
  // Create map of parameter name to value
  const { parameters } = workflow.spec.arguments;
  const parameterMap: Record<string, string> = {};
  parameters.forEach((parameter) => {
    parameterMap[parameter.name] = parameter.value;
  });

  return (
    <tr>
      <td>
        <FlowHistoryStatus workflow={workflow} />
      </td>
      {isPrFlow && (
        <td>
          <FlowHistoryPR
            flowName={flowName}
            workflow={workflow}
            parameterMap={parameterMap}
          />
        </td>
      )}
      <td>
        <FlowHistoryCommit parameterMap={parameterMap} />
      </td>
      <td>
        <Timestamp date={new Date(workflow.status.startedAt)} />
      </td>
      <td>
        <Timestamp
          date={
            workflow.status.finishedAt == null
              ? undefined
              : new Date(workflow.status.finishedAt)
          }
        />
      </td>
      <td>
        <FlowHistoryDuration workflow={workflow} />
      </td>
      <td>
        <FlowHistoryProgress workflow={workflow} />
      </td>
      <td>
        <FlowHistoryActions workflow={workflow} namespace={namespace} />
      </td>
    </tr>
  );
}

interface FlowHistoryCellProps {
  workflow: Workflow;
}
function FlowHistoryStatus({ workflow }: FlowHistoryCellProps) {
  switch (workflow.status.phase) {
    // todo handle more cases
    case "Succeeded":
      return <i className={`nf nf-fa-check_circle ${styles.successIcon}`} />;
    case "Failed":
      return <i className={`nf nf-fa-warning ${styles.dangerIcon}`} />;
    case "Running":
      return <i className="nf nf-fa-spinner" />;
    default:
      return <i className="nf nf-fa-question_circle" />;
  }
}

interface FlowHistoryPrProps extends FlowHistoryCellProps {
  flowName: string;
  parameterMap: Record<string, string>;
}
function FlowHistoryPR({
  workflow,
  flowName,
  parameterMap,
}: FlowHistoryPrProps) {
  const repoUrl = parameterMap.repo;
  if (!repoUrl) {
    throw new FlowHistoryError("did not find repoUrl in workflow parameters");
  }

  const workflowName = workflow.metadata.name;

  // The workflow name is in the form `${flowName}-${prNumber}-${shortSha}`
  let prNumber = workflowName.slice(flowName.length + 1);
  prNumber = prNumber.slice(0, prNumber.indexOf("-"));

  const prLink = getRepoPrLink(repoUrl, prNumber);
  return (
    <a
      className={styles.historyCommit}
      href={prLink}
      target="_blank"
      rel="noreferrer"
    >
      #{prNumber}
    </a>
  );
}

interface FlowHistoryCommitProps {
  parameterMap: Record<string, string>;
}
function FlowHistoryCommit({ parameterMap }: FlowHistoryCommitProps) {
  const commit = parameterMap.revision;
  if (!commit) {
    throw new FlowHistoryError("did not find commit in workflow parameters");
  }
  const repoUrl = parameterMap.repo;
  if (!repoUrl) {
    throw new FlowHistoryError("did not find repoUrl in workflow parameters");
  }

  const displayCommit = getDisplayCommit(commit);
  const commitLink = getRepoCommitLink(repoUrl, commit);
  return (
    <a
      className={styles.historyCommit}
      href={commitLink}
      target="_blank"
      rel="noreferrer"
    >
      {displayCommit}
    </a>
  );
}

function getDisplayTimestamp(d: Date, displayIsoTimestamps: boolean) {
  if (displayIsoTimestamps) {
    return d.toISOString();
  }
  return d.toLocaleString();
}

interface TimestampProps {
  date?: Date;
}
function Timestamp({ date }: TimestampProps) {
  const displayIsoTimestamps = useContext(DisplayIsoTimestampsContext);
  const setDisplayIsoTimestamps = useContext(SetDisplayIsoTimestampsContext);

  if (date == null) {
    return <i className="nf nf-fa-spinner" />;
  }
  const displayTimestamp = getDisplayTimestamp(date, displayIsoTimestamps);
  return (
    <div
      className={styles.timestamp}
      onClick={() => {
        setDisplayIsoTimestamps((b) => !b);
      }}
    >
      {displayTimestamp}
    </div>
  );
}

function FlowHistoryDuration({ workflow }: FlowHistoryCellProps) {
  const { startedAt, finishedAt } = workflow.status;
  if (finishedAt == null) {
    return <i className="nf nf-fa-spinner" />;
  }

  const durationMs = Date.parse(finishedAt) - Date.parse(startedAt);
  return getHumanDuration(durationMs);
}

function FlowHistoryProgress({ workflow }: FlowHistoryCellProps) {
  return workflow.status.progress;
}

interface FlowHistoryActionsProps {
  workflow: Workflow;
  namespace: string;
}
function FlowHistoryActions({ workflow, namespace }: FlowHistoryActionsProps) {
  return (
    <>
      <a
        href={`http://osoriano.com:2846/api/v1/namespaces/${namespace}/workflows/${workflow.metadata.name}`}
        target="_blank"
        rel="noreferrer"
        className={styles.linkIcon}
      >
        <i className="nf nf-fa-file_text_o" />
      </a>
      <a
        href={`https://argo.osoriano.com/workflows/${namespace}/${workflow.metadata.name}`}
        target="_blank"
        rel="noreferrer"
        className={styles.linkIcon}
      >
        <i className="nf nf-fa-external_link" />
      </a>
    </>
  );
}

class FlowHistoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistory };
