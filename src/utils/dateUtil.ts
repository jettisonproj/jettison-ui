/* Time units in seconds */
const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const MONTH = (DAY * 365) / 12;
const YEAR = DAY * 365;

const rtf = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

/**
 * Format the milliseconds into "Xh Ym Zs", omitting units if unnecessary.
 * Examples: "5s", "3m 5s", "2h 40m 33s"
 */
function formatDurationFromMs(totalMilliseconds: number) {
  return formatDurationFromSeconds(totalMilliseconds / 1000);
}

function formatDurationFromSeconds(totalSeconds: number) {
  let seconds = totalSeconds;

  const hours = Math.trunc(seconds / HOUR);
  seconds -= hours * HOUR;

  const minutes = Math.trunc(seconds / MINUTE);
  seconds -= minutes * MINUTE;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }
  return `${seconds}s`;
}

function formatTimestamp(secondsElapsed: number) {
  if (secondsElapsed > YEAR) {
    return rtf.format(-Math.round(secondsElapsed / YEAR), "year");
  }
  if (secondsElapsed > MONTH) {
    return rtf.format(-Math.round(secondsElapsed / MONTH), "month");
  }
  if (secondsElapsed > DAY) {
    return rtf.format(-Math.round(secondsElapsed / DAY), "day");
  }
  if (secondsElapsed > HOUR) {
    return rtf.format(-Math.round(secondsElapsed / HOUR), "hour");
  }
  if (secondsElapsed > MINUTE) {
    return rtf.format(-Math.round(secondsElapsed / MINUTE), "minute");
  }
  return rtf.format(-secondsElapsed, "second");
}

export { formatDurationFromMs, formatDurationFromSeconds, formatTimestamp };
