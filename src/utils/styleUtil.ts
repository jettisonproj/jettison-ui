function concatStyles(
  baseClass: string | undefined,
  additionalClass: string | undefined,
  addAdditionalClass: boolean,
) {
  if (baseClass == null || additionalClass == null) {
    throw new StyleUtilError("style class was unexpectedly null");
  }

  if (addAdditionalClass) {
    return `${baseClass} ${additionalClass}`;
  }
  return baseClass;
}

function concatOptionalStyle(
  baseClass: string | undefined,
  additionalClass: string | undefined,
) {
  if (baseClass == null) {
    throw new StyleUtilError("base style class was unexpectedly null");
  }

  if (additionalClass == null) {
    return baseClass;
  }

  return `${baseClass} ${additionalClass}`;
}

class StyleUtilError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { concatStyles, concatOptionalStyle };
