function getTriggerDisplayName(isPrFlow: boolean) {
  if (isPrFlow) {
    return "PR";
  }
  return "PUSH";
}

export { getTriggerDisplayName };
