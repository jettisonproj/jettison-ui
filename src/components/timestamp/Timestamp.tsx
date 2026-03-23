import { useEffect, useState, useRef, useCallback, useContext } from "react";

import { TimestampFormat } from "src/localState.ts";
import { formatTimestamp, getNextTickSeconds } from "src/utils/dateUtil.ts";
import {
  TimestampFormatContext,
  SetTimestampFormatContext,
} from "src/providers/provider.tsx";

function getNextTimestampFormat(timestampFormat: TimestampFormat) {
  switch (timestampFormat) {
    case TimestampFormat.Relative:
      return TimestampFormat.Locale;
    case TimestampFormat.Locale:
      return TimestampFormat.Iso;
    case TimestampFormat.Iso:
      return TimestampFormat.Relative;
    default:
      timestampFormat satisfies never;
      console.log("unknown timestamp format while calculating next");
      console.log(timestampFormat);
      throw new TimestampError(
        "unknown timestamp format while calculating next",
      );
  }
}

interface TimestampProps {
  date: Date;
  className?: string;
}
function Timestamp({ date, className }: TimestampProps) {
  const timestampFormat = useContext(TimestampFormatContext);
  const setTimestampFormat = useContext(SetTimestampFormatContext);

  let formattedTimestamp;
  switch (timestampFormat) {
    case TimestampFormat.Relative:
      formattedTimestamp = <RelativeTimestamp date={date} />;
      break;
    case TimestampFormat.Locale:
      formattedTimestamp = date.toLocaleString();
      break;
    case TimestampFormat.Iso:
      formattedTimestamp = date.toISOString();
      break;
    default:
      timestampFormat satisfies never;
      console.log("unknown timestamp format to display");
      console.log(timestampFormat);
      throw new TimestampError("unknown timestamp format to display");
  }

  return (
    <span
      className={className}
      onClick={() => {
        setTimestampFormat(getNextTimestampFormat);
      }}
    >
      {formattedTimestamp}
    </span>
  );
}

interface RelativeTimestampProps {
  date: Date;
}
function RelativeTimestamp({ date }: RelativeTimestampProps) {
  const [secondsElapsed, setSecondsElapsed] = useState(() =>
    Math.trunc((Date.now() - date.getTime()) / 1000),
  );
  const timeoutRef = useRef<number | null>(null);
  const nextTickSecondsRef = useRef<number | null>(null);

  const stopWatchTick = useCallback(
    () => {
      const currTickSeconds = nextTickSecondsRef.current;
      if (currTickSeconds == null) {
        throw new TimestampError("Unexpected curr tick seconds in timestamp");
      }

      const nextTickSeconds = getNextTickSeconds(
        secondsElapsed + currTickSeconds,
      );
      nextTickSecondsRef.current = nextTickSeconds;
      setSecondsElapsed(
        (prevSecondsElapsed) => prevSecondsElapsed + nextTickSeconds,
      );
      timeoutRef.current = setTimeout(stopWatchTick, nextTickSeconds * 1_000);
    },
    // Avoid depending on "secondsElapsed" since setTimeout is used
    // to schedule the next update instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setSecondsElapsed],
  );

  useEffect(
    () => {
      const nextTickSeconds = getNextTickSeconds(secondsElapsed);
      nextTickSecondsRef.current = nextTickSeconds;

      timeoutRef.current = setTimeout(stopWatchTick, nextTickSeconds * 1_000);

      return () => {
        if (timeoutRef.current != null) {
          clearTimeout(timeoutRef.current);
        }
      };
    },
    // Avoid depending on "secondsElapsed" since setTimeout is used
    // to schedule the next update instead
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stopWatchTick],
  );

  return formatTimestamp(secondsElapsed);
}

class TimestampError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { Timestamp };
