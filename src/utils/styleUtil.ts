function concatStyles(
  baseClass: string | undefined,
  additionalClass: string | undefined,
) {
  if (baseClass == null || additionalClass == null) {
    throw new StyleUtilError("style class was unexpectedly null");
  }

  return `${baseClass} ${additionalClass}`;
}

class StyleUtilError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { StyleUtilError, concatStyles };
