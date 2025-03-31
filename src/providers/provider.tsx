import { createContext, useState, useEffect, useRef } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";

import { ResourceEventHandler } from "src/providers/resourceEventHandler.ts";
import { localState } from "src/localState.ts";
import type { Namespace } from "src/data/types/namespace.ts";
import type { Flow } from "src/data/types/flowTypes.ts";
import type { ResourceList } from "src/data/types/resourceTypes.ts";

const DisplayIsoTimestampsContext = createContext(
  localState.getDisplayIsoTimestamps(),
);
const SetDisplayIsoTimestampsContext = createContext((() => {
  // Use no-op as the default, which is not expected to actually be called
}) as Dispatch<SetStateAction<boolean>>);
const NamespacesContext = createContext(
  null as Record<string, Namespace> | null,
);

const FlowsContext = createContext(
  null as Record<string, Record<string, Flow>> | null,
);

interface ProviderProps {
  children: ReactNode;
}
function Provider({ children }: ProviderProps) {
  const [namespaces, setNamespaces] = useState(
    null as Record<string, Namespace> | null,
  );
  const [flows, setFlows] = useState(
    null as Record<string, Record<string, Flow>> | null,
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
            {children}
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
};
