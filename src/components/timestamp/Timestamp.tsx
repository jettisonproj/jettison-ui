import { useContext } from "react";

import { TimestampFormat } from "src/localState.ts";
import { formatTimestamp } from "src/utils/dateUtil.ts";
import {
  TimestampFormatContext,
  SetTimestampFormatContext,
} from "src/providers/provider.tsx";

function getDisplayTimestamp(d: Date, timestampFormat: TimestampFormat) {
  switch (timestampFormat) {
    case TimestampFormat.Relative:
      return formatTimestamp(Math.trunc((Date.now() - d.getTime()) / 1000));
    case TimestampFormat.Locale:
      return d.toLocaleString();
    case TimestampFormat.Iso:
      return d.toISOString();
    default:
      timestampFormat satisfies never;
      console.log("unknown timestamp format to display");
      console.log(timestampFormat);
      throw new TimestampError("unknown timestamp format to display");
  }
}

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

  const displayTimestamp = getDisplayTimestamp(date, timestampFormat);
  return (
    <span
      className={className}
      onClick={() => {
        setTimestampFormat(getNextTimestampFormat);
      }}
    >
      {displayTimestamp}
    </span>
  );
}

class TimestampError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { Timestamp };
