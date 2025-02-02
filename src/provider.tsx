import { createContext, useState, useEffect, useRef } from "react";
import type { ReactNode, Dispatch, SetStateAction } from "react";

import { localState } from "src/localState.ts";

const DisplayIsoTimestampsContext = createContext(
  localState.getDisplayIsoTimestamps(),
);
const SetDisplayIsoTimestampsContext = createContext((() => {
  // Use no-op as the default, which is not expected to actually be called
}) as Dispatch<SetStateAction<boolean>>);

interface ProviderProps {
  children: ReactNode;
}
function Provider({ children }: ProviderProps) {
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

  return (
    <DisplayIsoTimestampsContext.Provider value={displayIsoTimestamps}>
      <SetDisplayIsoTimestampsContext.Provider value={setDisplayIsoTimestamps}>
        {children}
      </SetDisplayIsoTimestampsContext.Provider>
    </DisplayIsoTimestampsContext.Provider>
  );
}

export {
  Provider,
  DisplayIsoTimestampsContext,
  SetDisplayIsoTimestampsContext,
};
