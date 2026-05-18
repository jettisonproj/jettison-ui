import type { JSX } from "react";
import { useCallback, useContext, useEffect, useRef, useState } from "react";

import type { TimestampFormat } from "src/localState.ts";
import { TimestampFormats } from "src/localState.ts";
import {
  SetTimestampFormatContext,
  TimestampFormatContext,
} from "src/providers/provider.tsx";
import { formatTimestamp, getNextTickSeconds } from "src/utils/dateUtil.ts";

function getNextTimestampFormat(
  timestampFormat: TimestampFormat,
): TimestampFormat {
  switch (timestampFormat) {
    case TimestampFormats.Relative:
      return TimestampFormats.Locale;
    case TimestampFormats.Locale:
      return TimestampFormats.Iso;
    case TimestampFormats.Iso:
      return TimestampFormats.Relative;
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
function Timestamp({ date, className }: TimestampProps): JSX.Element {
  const timestampFormat = useContext(TimestampFormatContext);
  const setTimestampFormat = useContext(SetTimestampFormatContext);

  let formattedTimestamp;
  switch (timestampFormat) {
    case TimestampFormats.Relative:
      formattedTimestamp = <RelativeTimestamp date={date} />;
      break;
    case TimestampFormats.Locale:
      formattedTimestamp = date.toLocaleString();
      break;
    case TimestampFormats.Iso:
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
function RelativeTimestamp({ date }: RelativeTimestampProps): string {
  const [secondsElapsed, setSecondsElapsed] = useState(() =>
    Math.trunc((Date.now() - date.getTime()) / 1000),
  );

  /* For this component, the source of truth is secondsElapsedRef,
   * which will sync its values with secondsElapsed after a timeout */
  const secondsElapsedRef = useRef(secondsElapsed);
  const timeoutRef = useRef<number | null>(null);

  const stopWatchTick = useCallback(() => {
    setSecondsElapsed(secondsElapsedRef.current);

    const nextTickSeconds = getNextTickSeconds(secondsElapsedRef.current);
    if (nextTickSeconds < 0) {
      return;
    }
    secondsElapsedRef.current += nextTickSeconds;

    // Allow recursive call. Otherwise, gives the error:
    // "Cannot access variable before it is declared"
    // eslint-disable-next-line react-hooks/immutability
    timeoutRef.current = setTimeout(stopWatchTick, nextTickSeconds * 1_000);
  }, [setSecondsElapsed]);

  useEffect(() => {
    const nextTickSeconds = getNextTickSeconds(secondsElapsedRef.current);
    if (nextTickSeconds < 0) {
      return;
    }

    secondsElapsedRef.current += nextTickSeconds;
    timeoutRef.current = setTimeout(stopWatchTick, nextTickSeconds * 1_000);

    return (): void => {
      if (timeoutRef.current != null) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [stopWatchTick]);

  return formatTimestamp(secondsElapsed);
}

class TimestampError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { Timestamp };
