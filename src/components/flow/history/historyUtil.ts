import { trimGitSuffix } from "src/components/flow/flowUtil.ts";

/**
 * Get the link url to the commit in the repo
 */
function getRepoCommitLink(repoUrl: string, commit: string) {
  repoUrl = trimGitSuffix(repoUrl);
  return `${repoUrl}/commit/${commit}`;
}

/**
 * Ideally, this could be replaced by the Temporal api when it's available.
 * Handles data between 1 second and 1 week.
 */
function getHumanDuration(totalMs: number): string {
  // If < 1 minute, show seconds
  const totalSeconds = Math.trunc(totalMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.trunc(totalSeconds / 60);
  if (totalMinutes === 0) {
    return `${seconds}s`;
  }

  // If < 1 hour, show minutes and seconds
  const minutes = totalMinutes % 60;
  const totalHours = Math.trunc(totalMinutes / 60);
  if (totalHours === 0) {
    return `${minutes}m ${seconds}s`;
  }

  // If < 1 day, show hours and minutes
  const hours = totalHours % 24;
  const totalDays = Math.trunc(totalHours / 24);
  if (totalDays === 0) {
    return `${hours}h ${minutes}m`;
  }

  if (totalDays > 7) {
    return ">1w";
  }
  return `${totalDays}d ${hours}h`;
}

export { getRepoCommitLink, getHumanDuration };
