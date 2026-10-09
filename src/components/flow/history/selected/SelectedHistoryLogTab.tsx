import type { ChangeEvent, JSX } from "react";
import { useContext, useEffect, useMemo, useRef, useState } from "react";

import { Terminal } from "@xterm/xterm";
import "@xterm/xterm/css/xterm.css";

import styles from "src/components/flow/history/selected/SelectedHistoryLogTab.module.css";
import type { Container } from "src/data/types/podTypes.ts";
import type { NodePhase } from "src/data/types/workflowTypes.ts";
import { NodePhases } from "src/data/types/workflowTypes.ts";
import { FlowMessageTypes } from "src/providers/flowWebSocket.ts";
import {
  ContainerLogsContext,
  FlowWebSocketContext,
  PodsContext,
} from "src/providers/provider.tsx";

const defaultContainerName = "main";
const defaultContainerNames = [defaultContainerName];

interface SelectedHistoryLogTabProps {
  workflowNamespace: string;
  podName: string;
  nodePhase: NodePhase;
}
function SelectedHistoryLogTab({
  workflowNamespace,
  podName,
  nodePhase,
}: SelectedHistoryLogTabProps): JSX.Element {
  const [containerName, setContainerName] = useState(defaultContainerName);

  const onContainerNameChange = (ev: ChangeEvent<HTMLSelectElement>): void => {
    setContainerName(ev.target.value);
  };

  // todo support container log sse
  return (
    <>
      <div className={styles.containerLogHeader}>
        <div className={styles.containerLogHeaderLeft} />
        <SelectedHistoryContainerSelector
          workflowNamespace={workflowNamespace}
          podName={podName}
          containerName={containerName}
          onContainerNameChange={onContainerNameChange}
        />
        <div className={styles.containerLogHeaderRight}>
          <a
            href={`/api/v1/namespaces/${workflowNamespace}/pods/${podName}`}
            target="_blank"
            rel="noreferrer"
            className={styles.containerLogLink}
          >
            <i className={`nf nf-fa-file_text_o ${styles.containerLogLinkIcon}`} />{" "}
            <span className={styles.containerLogLinkText}>View Pod YAML</span>
          </a>
          <a
            href={"https://google.com"}
            target="_blank"
            rel="noreferrer"
            className={styles.containerLogLink}
          >
            <i
              className={`nf nf-fa-external_link ${styles.containerLogLinkIcon}`}
            />{" "}
            <span className={styles.containerLogLinkText}>View in New Tab</span>
          </a>
        </div>
      </div>
      <SelectedHistoryLog
        workflowNamespace={workflowNamespace}
        podName={podName}
        nodePhase={nodePhase}
        containerName={containerName}
      />
    </>
  );
}

interface SelectedHistoryContainerSelectorProps {
  workflowNamespace: string;
  podName: string;
  containerName: string;
  onContainerNameChange: (ev: ChangeEvent<HTMLSelectElement>) => void;
}
function SelectedHistoryContainerSelector({
  workflowNamespace,
  podName,
  containerName,
  onContainerNameChange,
}: SelectedHistoryContainerSelectorProps): JSX.Element {
  const pods = useContext(PodsContext);
  const pod = pods?.get(workflowNamespace)?.get(podName);

  const podContainerNames = useMemo(() => {
    if (pod == null) {
      return defaultContainerNames;
    }
    return getContainerNames(pod.spec.containers);
  }, [pod]);

  const podInitContainerNames = useMemo(() => {
    if (pod == null) {
      return [];
    }
    return getContainerNames(pod.spec.initContainers);
  }, [pod]);

  const containerNames = useMemo(() => {
    return podContainerNames.concat(podInitContainerNames);
  }, [podContainerNames, podInitContainerNames]);

  return (
    <div className={styles.containerLogHeaderCenter}>
      <span className={styles.containerNameLabel}>Container</span>
      <select
        value={containerName}
        onChange={onContainerNameChange}
        className={styles.containerNameSelector}
      >
        {containerNames.map((containerNameOption) => (
          <option
            key={containerNameOption}
            value={containerNameOption}
            className={styles.containerNameOption}
          >
            {containerNameOption}
          </option>
        ))}
      </select>
    </div>
  );
}

function getContainerNames(containers: Container[]): string[] {
  return containers.map((container) => container.name);
}

interface SelectedHistoryLogProps extends SelectedHistoryLogTabProps {
  containerName: string;
}
function SelectedHistoryLog({
  workflowNamespace,
  podName,
  nodePhase,
  containerName,
}: SelectedHistoryLogProps): JSX.Element {
  const containerLogs = useContext(ContainerLogsContext);
  const flowWebSocket = useContext(FlowWebSocketContext);
  const elementRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);

  const logLines = containerLogs
    ?.get(workflowNamespace)
    ?.get(podName)
    ?.get(containerName);

  /* Open xterm and set xtermRef */
  useEffect(() => {
    const currentElement = elementRef.current;
    if (currentElement == null) {
      console.log("error: null element ref while rendering container logs");
      return;
    }

    const term = new Terminal({ cols: 150, rows: 50 });
    term.open(currentElement);
    xtermRef.current = term;

    return (): void => {
      term.dispose();
    };
  }, []);

  /* Write logs to xterm */
  useEffect(() => {
    const term = xtermRef.current;
    if (term == null) {
      console.log("error: null xterm while rendering container logs");
      return;
    }

    if (logLines == null) {
      return;
    }

    term.clear();
    for (const logLine of logLines) {
      term.writeln(logLine);
    }
  }, [logLines, workflowNamespace, podName, containerName]);

  /* Send container log request if pod is available */
  useEffect(() => {
    if (nodeLogsUnavailable(nodePhase)) {
      return;
    }

    flowWebSocket.send({
      messageType: FlowMessageTypes.containerLog,
      messageData: {
        namespace: workflowNamespace,
        podName: podName,
        containerName: containerName,
      },
    });
  }, [nodePhase, flowWebSocket, workflowNamespace, podName, containerName]);

  return <div className={styles.containerXterm} ref={elementRef} />;
}

function nodeLogsUnavailable(nodePhase: NodePhase): boolean {
  return (
    nodePhase === NodePhases.Pending ||
    nodePhase === NodePhases.Skipped ||
    nodePhase === NodePhases.Omitted
  );
}

export { SelectedHistoryLogTab };
