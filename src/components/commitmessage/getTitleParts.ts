const TitlePartTypes = {
  regularText: 0,
  prText: 1,
  backtickText: 2,
} as const;
type TitlePartType = (typeof TitlePartTypes)[keyof typeof TitlePartTypes];

/**
 * Given a commit title, return the parts. Each part contains
 * the segment text and the part type such as pr number, backtick
 * expression, or regular text
 */
interface TitlePart {
  titlePartText: string;
  titlePartType: TitlePartType;
}
function getTitleParts(title: string): TitlePart[] {
  // These patterns match:
  // - backtick expression
  // - PR numbers in a commit title
  // Also, the match is captured. Examples of captured groups:
  // - `deadbeef`
  // - "(#53)"
  const partsRegex = /(`(?:\\`|[^`])+`)|(\(#\d+\))/;
  // These patterns are similar to above, but do not capture the group and check
  // for an exact match
  const backticksExactRegex = /^`(?:\\`|[^`])+`$/;
  const prNumberExactRegex = /^\(#\d+\)$/;

  const titlePartTexts = title.split(partsRegex);
  const titlePartsWithMetadata: TitlePart[] = [];

  for (const titlePartText of titlePartTexts) {
    const prevTitlePart = titlePartsWithMetadata.at(-1);

    if (backticksExactRegex.test(titlePartText)) {
      // The title part is in the form "`...`"

      if (prevTitlePart?.titlePartType === TitlePartTypes.backtickText) {
        // Edge case: in case of subsequent backtick expressions,
        // join with the preceding backtick expression
        prevTitlePart.titlePartText += titlePartText.slice(1, -1);
      } else {
        // This is the first part of the backtick expression (normal case)
        titlePartsWithMetadata.push({
          titlePartText: titlePartText.slice(1, -1),
          titlePartType: TitlePartTypes.backtickText,
        });
      }
    } else if (prNumberExactRegex.test(titlePartText)) {
      // The title part is in the form "(#N)", where N is a number

      // Handle the opening parenthesis
      if (prevTitlePart?.titlePartType === TitlePartTypes.regularText) {
        // Combine with previous part if available (normal case)
        prevTitlePart.titlePartText += "(";
      } else {
        // Edge case: in case the title started with a PR number,
        // add the segment containing the leading parenthesis
        titlePartsWithMetadata.push({
          titlePartText: "(",
          titlePartType: TitlePartTypes.regularText,
        });
      }

      // Handle the "#N" (PR number)
      titlePartsWithMetadata.push({
        titlePartText: titlePartText.slice(1, -1), // trim the parentheses
        titlePartType: TitlePartTypes.prText,
      });

      // Handle the closing parenthesis
      titlePartsWithMetadata.push({
        titlePartText: ")",
        titlePartType: TitlePartTypes.regularText,
      });
    } else if (titlePartText) {
      if (prevTitlePart?.titlePartType === TitlePartTypes.regularText) {
        // Edge case: in case the commit message continues after a PR number,
        // join with the preceding closing parenthesis
        prevTitlePart.titlePartText += titlePartText;
      } else {
        // This is the first part of the commit message (normal case)
        titlePartsWithMetadata.push({
          titlePartText,
          titlePartType: TitlePartTypes.regularText,
        });
      }
    }
  }

  return titlePartsWithMetadata;
}

export { TitlePartTypes, getTitleParts };
export type { TitlePart };
