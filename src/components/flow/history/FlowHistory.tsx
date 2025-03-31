import { useContext } from "react";
import styles from "src/components/flow/history/FlowHistory.module.css";
import {
  getRepoCommitLink,
  getHumanDuration,
} from "src/components/flow/history/historyUtil.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import {
  DisplayIsoTimestampsContext,
  SetDisplayIsoTimestampsContext,
} from "src/providers/provider.tsx";

const COMMIT_DISPLAY_LEN = 7;

interface FlowHistoryProps {
  workflows: Workflow[];
  namespace: string;
}
function FlowHistory({ workflows, namespace }: FlowHistoryProps) {
  if (workflows.length === 0) {
    return <p>No flow history found</p>;
  }
  workflows = workflows.concat(workflows);
  workflows = workflows.concat(workflows);
  workflows = workflows.concat(workflows);
  workflows = workflows.concat(workflows);
  return (
    <table>
      <thead>
        <tr>
          <th></th>
          <th>Commit</th>
          <th>Started</th>
          <th>Finished</th>
          <th>Duration</th>
          <th>Progress</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {workflows.map((workflow, i) => (
          <tr key={i}>
            <td>
              <FlowHistoryStatus workflow={workflow} />
            </td>
            <td>
              <FlowHistoryCommit workflow={workflow} />
            </td>
            <td>
              <Timestamp date={new Date(workflow.status.startedAt)} />
            </td>
            <td>
              <Timestamp date={new Date(workflow.status.finishedAt)} />
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
        ))}
      </tbody>
    </table>
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
    default:
      return <i className="nf nf-fa-question_circle" />;
  }
}

function FlowHistoryCommit({ workflow }: FlowHistoryCellProps) {
  // Create map of parameter name to value
  const { parameters } = workflow.spec.arguments;
  const parameterMap: Record<string, string> = {};
  parameters.forEach((parameter) => {
    parameterMap[parameter.name] = parameter.value;
  });

  const commit = parameterMap.revision;
  if (!commit) {
    throw new FlowHistoryError("did not find commit in workflow parameters");
  }
  const repoUrl = parameterMap.repo;
  if (!repoUrl) {
    throw new FlowHistoryError("did not find repoUrl in workflow parameters");
  }

  const displayCommit = commit.slice(0, COMMIT_DISPLAY_LEN);
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
  date: Date;
}
function Timestamp({ date }: TimestampProps) {
  const displayIsoTimestamps = useContext(DisplayIsoTimestampsContext);
  const setDisplayIsoTimestamps = useContext(SetDisplayIsoTimestampsContext);
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
    <a
      href={`https://argo.osoriano.com/workflows/${namespace}/${workflow.metadata.name}`}
      target="_blank"
      rel="noreferrer"
    >
      <i className={`nf nf-fa-external_link ${styles.linkIcon}`} />
    </a>
  );
}

class FlowHistoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowHistory };
