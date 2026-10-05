import type { TimestampFormat } from "src/localState.ts";
import { TimestampFormats } from "src/localState.ts";

// The "T" in the RFC3339Nano timestamp is at index 10
const T_INDEX = 10;

// The decimal point in the RFC3339Nano timestamp is at index 19
// Add 4 to keep the decimal and 3 digits
const DECIMAL_END_INDEX = 23;

// The index where the RFC3339Nano timestamp ends, excluding the end
const TS_END_INDEX = 30;

const ANSI_DIM_SEQ = "\x1B[2m";
const ANSI_RESET_SEQ = "\x1B[0m";

function transformContainerLogLines(
  logLines: string[],
  timestampFormat: TimestampFormat,
): string[] {
  return logLines.map((logLine) =>
    transformContainerLogLine(logLine, timestampFormat),
  );
}

/**
 * The container logs contain timestamps due to PodLogOptions.Timestamps
 * set to true. See:
 * https://pkg.go.dev/k8s.io/api/core/v1#PodLogOptions
 *
 * The timestamps use RFC3339Nano. Switch to a more human readable format.
 */
function transformContainerLogLine(
  logLine: string,
  timestampFormat: TimestampFormat,
): string {
  switch (timestampFormat) {
    case TimestampFormats.Relative:
    // Relative not supported. Fall through to Locale time
    case TimestampFormats.Locale:
      return transformContainerLogLineLocale(logLine);
    case TimestampFormats.Iso:
      return transformContainerLogLineIso(logLine);
      break;
    default:
      timestampFormat satisfies never;
      console.log("unknown timestamp format for container logs");
      console.log(timestampFormat);
      throw new ContainerLogUtilError(
        "unknown timestamp format for container logs",
      );
  }
}

/**
 * Format the timestamp from RFC3339Nano to a more human readable format
 *
 * Example Input:
 *   "2026-10-04T16:27:12.123456789Z"
 * Example Output:
 *   "2026-10-04 16:27:12.123Z"
 */
function transformContainerLogLineIso(logLine: string): string {
  return (
    ANSI_DIM_SEQ +
    logLine.slice(0, T_INDEX) +
    " " +
    logLine.slice(T_INDEX + 1, DECIMAL_END_INDEX) +
    "Z" +
    ANSI_RESET_SEQ +
    logLine.slice(TS_END_INDEX)
  );
}

/**
 * Fromat the timestamp from RFC339Nano to locale time.
 *
 * Example Input:
 *   "2026-10-04T16:27:12.123456789Z"
 * Example Output:
 *   "10/4/2026, 9:27:12 AM"
 */
function transformContainerLogLineLocale(logLine: string): string {
  return (
    ANSI_DIM_SEQ +
    new Date(logLine.slice(0, TS_END_INDEX)).toLocaleString() +
    ANSI_RESET_SEQ +
    logLine.slice(TS_END_INDEX)
  );
}

class ContainerLogUtilError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { transformContainerLogLines };
