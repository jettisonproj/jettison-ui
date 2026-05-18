function concatOptionalStyle(
  baseClass: string,
  additionalClass: string | undefined,
): string {
  if (additionalClass == null) {
    return baseClass;
  }

  return `${baseClass} ${additionalClass}`;
}

export { concatOptionalStyle };
