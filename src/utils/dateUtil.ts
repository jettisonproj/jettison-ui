/* Time units in seconds */
const MINUTE = 60;
const HOUR = 60 * MINUTE;

/* Format the milliseconds into "H:M:S" */
function formatDuration(totalMilliseconds: number) {
  let seconds = totalMilliseconds / 1000;

  const hours = Math.trunc(seconds / HOUR);
  seconds -= hours * HOUR;

  const minutes = Math.trunc(seconds / MINUTE);
  seconds -= minutes * MINUTE;

  if (hours > 0) {
    return `${formatSegment(hours)}:${formatSegment(minutes)}:${formatSegment(seconds)}`;
  }
  return `${formatSegment(minutes)}:${formatSegment(seconds)}`;
}

/** Format the duration segment by adding zero padding if needed */
function formatSegment(n: number) {
  if (n < 10) {
    return `0${n}`;
  }
  return n.toString();
}

export { formatDuration };
