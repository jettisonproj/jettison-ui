/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any */
// todo remove linting exceptions needed due to async loading of xterm
import { useContext, useEffect, useRef, useState, ChangeEvent } from "react";

import { NodePhase } from "src/data/types/workflowTypes.ts";
import { Container } from "src/data/types/podTypes.ts";
import { FlowMessageType } from "src/providers/flowWebSocket.ts";
import {
  FlowWebSocketContext,
  PodsContext,
  ContainerLogsContext,
} from "src/providers/provider.tsx";
import styles from "src/components/flow/history/selected/SelectedHistoryLogTab.module.css";

const defaultContainerName = "main";

interface SelectedHistoryLogTabProps {
  workflowNamespace: string;
  podName: string;
  nodePhase: NodePhase;
}
function SelectedHistoryLogTab({
  workflowNamespace,
  podName,
  nodePhase,
}: SelectedHistoryLogTabProps) {
  const [containerName, setContainerName] = useState(defaultContainerName);
  const containerLogs = useContext(ContainerLogsContext);

  const onContainerNameChange = (ev: ChangeEvent<HTMLSelectElement>) => {
    setContainerName(ev.target.value);
  };

  const logLines = containerLogs
    ?.get(workflowNamespace)
    ?.get(podName)
    ?.get(containerName);

  // todo support container log sse
  return (
    <>
      <div className={styles.containerNameSelectorContainer}>
        <span className={styles.containerNameLabel}>Container</span>
        <SelectedHistoryContainerSelector
          workflowNamespace={workflowNamespace}
          podName={podName}
          containerName={containerName}
          onContainerNameChange={onContainerNameChange}
        />
        <a
          href={`http://osoriano.com:2846/api/v1/namespaces/${workflowNamespace}/pods/${podName}`}
          target="_blank"
          rel="noreferrer"
          className={styles.actionIcon}
        >
          <i className="nf nf-fa-file_text_o" />
        </a>
        <a
          href={"https://google.com"}
          target="_blank"
          rel="noreferrer"
          className={styles.actionIcon}
        >
          <i className="nf nf-fa-external_link" />
        </a>
      </div>
      <SelectedHistoryLog
        workflowNamespace={workflowNamespace}
        podName={podName}
        nodePhase={nodePhase}
        containerName={containerName}
        logLines={logLines}
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
}: SelectedHistoryContainerSelectorProps) {
  const [containerNames, setContainerNames] = useState([defaultContainerName]);
  const pods = useContext(PodsContext);

  useEffect(() => {
    const pod = pods?.get(workflowNamespace)?.get(podName);
    if (pod == null) {
      return;
    }
    setContainerNames((oldContainerNames) => {
      const podContainerNames = getContainerNames(pod.spec.containers);
      const podInitContainerNames = getContainerNames(pod.spec.initContainers);
      const newContainerNames = podContainerNames.concat(podInitContainerNames);

      if (oldContainerNames.length !== newContainerNames.length) {
        return newContainerNames;
      }

      for (let i = 0; i < oldContainerNames.length; i += 1) {
        if (oldContainerNames[i] !== newContainerNames[i]) {
          return newContainerNames;
        }
      }

      return oldContainerNames;
    });
  }, [pods, workflowNamespace, podName]);

  return (
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
  );
}

function getContainerNames(containers: Container[]) {
  return containers.map((container) => container.name);
}

interface SelectedHistoryLogProps extends SelectedHistoryLogTabProps {
  containerName: string;
  logLines: Set<string> | undefined;
}
function SelectedHistoryLog({
  workflowNamespace,
  podName,
  nodePhase,
  containerName,
  logLines,
}: SelectedHistoryLogProps) {
  const flowWebSocket = useContext(FlowWebSocketContext);
  const elementRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Promise<any> | null>(null);

  /* Open xterm and set xtermRef */
  useEffect(() => {
    let closed = false;
    xtermRef.current = import("@xterm/xterm")
      .then(({ Terminal }) => {
        if (closed) {
          return null;
        }

        const currentElement = elementRef.current;
        if (currentElement == null) {
          console.log("error: null element ref while rendering container logs");
          return null;
        }

        const term = new Terminal({ cols: 150, rows: 50 });
        term.open(currentElement);
        return term;
      })
      .catch((err: unknown) => {
        console.log("error while opening xterm:");
        console.log(err);
      });

    return () => {
      closed = true;
      xtermRef.current
        ?.then((term) => {
          if (term != null) {
            term.dispose();
          }
        })
        .catch((err: unknown) => {
          console.log("error while cleaning up xterm:");
          console.log(err);
        });
      xtermRef.current = null;
    };
  }, []);

  /* Write logs to xterm */
  useEffect(() => {
    xtermRef.current
      ?.then((term) => {
        // In case the xterm has been closed, return early
        if (xtermRef.current == null || term == null) {
          return;
        }

        if (logLines == null) {
          return;
        }

        term.clear();
        for (const logLine of logLines) {
          term.writeln(logLine);
        }
      })
      .catch((err: unknown) => {
        console.log("error while writing to xterm");
        console.log(err);
      });
  }, [logLines, workflowNamespace, podName, containerName]);

  /* Send container log request if pod is available */
  useEffect(() => {
    if (nodeLogsUnavailable(nodePhase)) {
      return;
    }

    flowWebSocket.send({
      messageType: FlowMessageType.containerLog,
      messageData: {
        namespace: workflowNamespace,
        podName: podName,
        containerName: containerName,
      },
    });
  }, [nodePhase, flowWebSocket, workflowNamespace, podName, containerName]);

  /* Load xterm css */
  useEffect(() => {
    import("@xterm/xterm/css/xterm.css").catch((err: unknown) => {
      console.log("failed to load xterm css");
      console.log(err);
    });
  }, []);

  return <div className={styles.containerXterm} ref={elementRef} />;
}

function nodeLogsUnavailable(nodePhase: NodePhase) {
  return (
    nodePhase === NodePhase.Pending ||
    nodePhase === NodePhase.Skipped ||
    nodePhase === NodePhase.Omitted
  );
}

export { SelectedHistoryLogTab };
