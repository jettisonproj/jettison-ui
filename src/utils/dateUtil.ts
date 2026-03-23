/* Time units in seconds */
const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const YEAR = DAY * 365;
const MONTH = YEAR / 12;

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

/**
 * Format the seconds into a relative timestamp.
 * Examples: "4 hours ago", "5 days ago", "last month"
 */
function formatTimestamp(secondsElapsed: number) {
  if (secondsElapsed >= YEAR) {
    return rtf.format(-Math.round(secondsElapsed / YEAR), "year");
  }
  if (secondsElapsed >= MONTH) {
    return rtf.format(-Math.round(secondsElapsed / MONTH), "month");
  }
  if (secondsElapsed >= DAY) {
    return rtf.format(-Math.round(secondsElapsed / DAY), "day");
  }
  if (secondsElapsed >= HOUR) {
    return rtf.format(-Math.round(secondsElapsed / HOUR), "hour");
  }
  if (secondsElapsed >= MINUTE) {
    return rtf.format(-Math.round(secondsElapsed / MINUTE), "minute");
  }
  return rtf.format(-secondsElapsed, "second");
}

/**
 * Returns the next duration which a tick operation should be performed in
 * order to update the formatted timestamp, or -1 if no tick is needed.
 */
function getNextTickSeconds(secondsElapsed: number) {
  if (secondsElapsed < MINUTE) {
    return 1;
  }
  if (secondsElapsed < DAY) {
    return MINUTE;
  }
  // Avoid the next tick if a day has elapsed
  return -1;
}

export {
  formatDurationFromMs,
  formatDurationFromSeconds,
  formatTimestamp,
  getNextTickSeconds,
};
