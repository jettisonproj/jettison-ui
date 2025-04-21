import { createContext, useState, useEffect, useRef } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";

import { ResourceEventHandler } from "src/providers/resourceEventHandler.ts";
import { localState } from "src/localState.ts";
import type { Flow } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import type { ResourceList } from "src/data/types/resourceTypes.ts";

const DisplayIsoTimestampsContext = createContext(
  localState.getDisplayIsoTimestamps(),
);
const SetDisplayIsoTimestampsContext = createContext((() => {
  // Use no-op as the default, which is not expected to actually be called
}) as Dispatch<SetStateAction<boolean>>);
const NamespacesContext = createContext(null as Set<string> | null);

const FlowsContext = createContext(
  null as Map<string, Map<string, Flow>> | null,
);

const ApplicationsContext = createContext(
  null as Map<string, Map<string, Application>> | null,
);

const RolloutsContext = createContext(
  null as Map<string, Map<string, Rollout>> | null,
);

const WorkflowsContext = createContext(
  null as Map<string, Map<string, Map<string, Workflow>>> | null,
);

interface ProviderProps {
  children: ReactNode;
}
function Provider({ children }: ProviderProps) {
  const [namespaces, setNamespaces] = useState(null as Set<string> | null);
  const [flows, setFlows] = useState(
    null as Map<string, Map<string, Flow>> | null,
  );
  const [applications, setApplications] = useState(
    null as Map<string, Map<string, Application>> | null,
  );

  const [rollouts, setRollouts] = useState(
    null as Map<string, Map<string, Rollout>> | null,
  );

  const [workflows, setWorkflows] = useState(
    null as Map<string, Map<string, Map<string, Workflow>>> | null,
  );

  const [displayIsoTimestamps, setDisplayIsoTimestamps] = useState(
    localState.getDisplayIsoTimestamps(),
  );

  /* Update localStorage whenever the value changes */
  const previousDisplayIsoTimestamps = useRef(displayIsoTimestamps);
  useEffect(() => {
    if (previousDisplayIsoTimestamps.current != displayIsoTimestamps) {
      localState.setDisplayIsoTimestamps(displayIsoTimestamps);
      previousDisplayIsoTimestamps.current = displayIsoTimestamps;
    }
  }, [displayIsoTimestamps]);

  /* Handle websocket notifications */
  useEffect(() => {
    const server = "ws://osoriano.com:2846/ws";
    const ws = new WebSocket(server);

    ws.onopen = () => {
      console.log("Websocket opened");
    };

    ws.onmessage = (ev: MessageEvent<string>) => {
      try {
        console.log("got websocket resource list");
        const resourceList = JSON.parse(ev.data) as ResourceList;
        console.log(resourceList);

        const resourceEventHandler = new ResourceEventHandler(resourceList);

        if (resourceEventHandler.hasNamespaceEvents()) {
          setNamespaces((namespaces) =>
            resourceEventHandler.getUpdatedNamespaces(namespaces),
          );
        }

        if (resourceEventHandler.hasFlowEvents()) {
          setFlows((flows) => resourceEventHandler.getUpdatedFlows(flows));
        }

        if (resourceEventHandler.hasApplicationEvents()) {
          setApplications((applications) =>
            resourceEventHandler.getUpdatedApplications(applications),
          );
        }

        if (resourceEventHandler.hasRolloutEvents()) {
          setRollouts((rollouts) =>
            resourceEventHandler.getUpdatedRollouts(rollouts),
          );
        }

        if (resourceEventHandler.hasWorkflowEvents()) {
          setWorkflows((workflows) =>
            resourceEventHandler.getUpdatedWorkflows(workflows),
          );
        }
      } catch (err) {
        if (!(err instanceof Error)) {
          console.log("unknown error while processing message");
          console.log(err);
          throw new Error("unknown error while processing message", {
            cause: err,
          });
        }
        console.log(`Error processing websocket message: ${err}`);
        console.log(err);
      }
    };

    ws.onclose = (ev) => {
      console.log("Websocket closed");
      console.log(`Code: ${ev.code}`);
      console.log(`Reason: ${ev.reason}`);
    };

    ws.onerror = (err) => {
      if (!(err instanceof Error)) {
        console.log("unknown error from websocket");
        console.log(err);
        throw new Error("unknown error from websocket", { cause: err });
      }
      console.log(`Websocket encountered error: ${err}`);
      console.log(err);
    };
  }, []);

  return (
    <DisplayIsoTimestampsContext.Provider value={displayIsoTimestamps}>
      <SetDisplayIsoTimestampsContext.Provider value={setDisplayIsoTimestamps}>
        <NamespacesContext.Provider value={namespaces}>
          <FlowsContext.Provider value={flows}>
            <ApplicationsContext.Provider value={applications}>
              <RolloutsContext.Provider value={rollouts}>
                <WorkflowsContext.Provider value={workflows}>
                  {children}
                </WorkflowsContext.Provider>
              </RolloutsContext.Provider>
            </ApplicationsContext.Provider>
          </FlowsContext.Provider>
        </NamespacesContext.Provider>
      </SetDisplayIsoTimestampsContext.Provider>
    </DisplayIsoTimestampsContext.Provider>
  );
}

export {
  Provider,
  DisplayIsoTimestampsContext,
  SetDisplayIsoTimestampsContext,
  NamespacesContext,
  FlowsContext,
  ApplicationsContext,
  RolloutsContext,
  WorkflowsContext,
};
