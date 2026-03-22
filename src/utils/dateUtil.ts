/* Time units in seconds */
const MINUTE = 60;
const HOUR = 60 * MINUTE;

/* Format the milliseconds into "H:M:S" */
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

export { formatDurationFromMs, formatDurationFromSeconds };
