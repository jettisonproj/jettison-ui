function concatOptionalStyle(
  baseClass: string,
  additionalClass: string | undefined,
) {
  if (additionalClass == null) {
    return baseClass;
  }

  return `${baseClass} ${additionalClass}`;
}

export { concatOptionalStyle };
