const PR_DISPLAY_NAME = "PR";
const PUSH_DISPLAY_NAME = "PUSH";

function getTriggerDisplayName(isPrFlow: boolean) {
  if (isPrFlow) {
    return PR_DISPLAY_NAME;
  }
  return PUSH_DISPLAY_NAME;
}

export { getTriggerDisplayName, PR_DISPLAY_NAME, PUSH_DISPLAY_NAME };
