const BUILD_DISPLAY_NAME = "BUILD";
const PUBLISH_DISPLAY_NAME = "PUBLISH";
const PR_DISPLAY_NAME = "PR";
const PUSH_DISPLAY_NAME = "PUSH";

function getTriggerDisplayName(isPrFlow: boolean) {
  if (isPrFlow) {
    return PR_DISPLAY_NAME;
  }
  return PUSH_DISPLAY_NAME;
}

export {
  getTriggerDisplayName,
  PR_DISPLAY_NAME,
  PUSH_DISPLAY_NAME,
  BUILD_DISPLAY_NAME,
  PUBLISH_DISPLAY_NAME,
};
