import { useContext } from "react";

import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import {
  DisplayIsoTimestampsContext,
  SetDisplayIsoTimestampsContext,
} from "src/providers/provider.tsx";

function getDisplayTimestamp(d: Date, displayIsoTimestamps: boolean) {
  if (displayIsoTimestamps) {
    return d.toISOString();
  }
  return d.toLocaleString();
}

interface TimestampProps {
  date?: Date;
  className?: string;
}
function Timestamp({ date, className }: TimestampProps) {
  const displayIsoTimestamps = useContext(DisplayIsoTimestampsContext);
  const setDisplayIsoTimestamps = useContext(SetDisplayIsoTimestampsContext);

  if (date == null) {
    return <LoadIcon />;
  }
  const displayTimestamp = getDisplayTimestamp(date, displayIsoTimestamps);
  return (
    <span
      className={className}
      onClick={() => {
        setDisplayIsoTimestamps((b) => !b);
      }}
    >
      {displayTimestamp}
    </span>
  );
}

export { Timestamp };
