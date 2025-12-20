import { createContext, useState, useEffect, useRef } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";

import { ResourceEventHandler } from "src/providers/resourceEventHandler.ts";
import { localState } from "src/localState.ts";
import { flowWebSocket } from "src/providers/flowWebSocket.ts";
import type { PushPrFlows } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import type { ResourceList } from "src/data/types/resourceTypes.ts";

const FlowWebSocketContext = createContext(flowWebSocket);

const DisplayIsoTimestampsContext = createContext(
  localState.getDisplayIsoTimestamps(),
);
const SetDisplayIsoTimestampsContext = createContext((() => {
  // Use no-op as the default, which is not expected to actually be called
}) as Dispatch<SetStateAction<boolean>>);

const FlowsContext = createContext(null as Map<string, PushPrFlows> | null);

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
  const [flows, setFlows] = useState(null as Map<string, PushPrFlows> | null);
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

  /* Handle flowWebSocket notifications */
  useEffect(() => {
    flowWebSocket.setOnMessage((ev: MessageEvent<string>) => {
      try {
        console.log("got flowWebSocket resource list");
        const resourceList = JSON.parse(ev.data) as ResourceList;
        console.log(resourceList);

        const resourceEventHandler = new ResourceEventHandler(resourceList);

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
          console.log(ev.data);
          throw new Error("unknown error while processing message", {
            cause: err,
          });
        }
        console.log(`Error processing flowWebSocket message: ${err}`);
        console.log(err);
        console.log(ev.data);
      }
    });
  }, []);

  return (
    <FlowWebSocketContext.Provider value={flowWebSocket}>
      <DisplayIsoTimestampsContext.Provider value={displayIsoTimestamps}>
        <SetDisplayIsoTimestampsContext.Provider
          value={setDisplayIsoTimestamps}
        >
          <FlowsContext.Provider value={flows}>
            <ApplicationsContext.Provider value={applications}>
              <RolloutsContext.Provider value={rollouts}>
                <WorkflowsContext.Provider value={workflows}>
                  {children}
                </WorkflowsContext.Provider>
              </RolloutsContext.Provider>
            </ApplicationsContext.Provider>
          </FlowsContext.Provider>
        </SetDisplayIsoTimestampsContext.Provider>
      </DisplayIsoTimestampsContext.Provider>
    </FlowWebSocketContext.Provider>
  );
}

export {
  Provider,
  FlowWebSocketContext,
  DisplayIsoTimestampsContext,
  SetDisplayIsoTimestampsContext,
  FlowsContext,
  ApplicationsContext,
  RolloutsContext,
  WorkflowsContext,
};
