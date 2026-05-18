/**
 * Given a commit title, return the parts segmented
 * by PR numbers. Each part contains the segment text
 * and whether it is a PR number
 */
interface TitlePart {
  titlePart: string;
  isPrNumber: boolean;
}
function getTitleParts(title: string): TitlePart[] {
  // This regex matches PR numbers in a commit title and captures the group
  // Example of captured group: "(#53)"
  const prNumberRegex = /(\(#\d+\))/;
  // This regex is similar to above, but does not capture the group and checks
  // for an exact match
  const prNumberExactRegex = /^\(#\d+\)$/;

  const titleParts = title.split(prNumberRegex);
  const titlePartsWithMetadata: TitlePart[] = [];

  for (const titlePart of titleParts) {
    const prevTitlePart = titlePartsWithMetadata.at(-1);

    if (prNumberExactRegex.test(titlePart)) {
      // The title part is in the form "(#N)", where N is a number

      // Handle the opening parenthesis
      if (prevTitlePart != null) {
        // Combine with previous part if available (normal case)
        prevTitlePart.titlePart += "(";
      } else {
        // Edge case: in case the title started with a PR number,
        // add the segment containing the leading parenthesis
        titlePartsWithMetadata.push({ titlePart: "(", isPrNumber: false });
      }

      // Handle the "#N" (PR number)
      titlePartsWithMetadata.push({
        titlePart: titlePart.slice(1, -1), // trim the parentheses
        isPrNumber: true,
      });

      // Handle the closing parenthesis
      titlePartsWithMetadata.push({ titlePart: ")", isPrNumber: false });
    } else if (titlePart) {
      if (prevTitlePart != null) {
        // Edge case: in case the commit message continues after a PR number,
        // join with the preceding closing parenthesis
        prevTitlePart.titlePart += titlePart;
      } else {
        // This is the first part of the commit message (normal case)
        titlePartsWithMetadata.push({
          titlePart,
          isPrNumber: false,
        });
      }
    }
  }

  return titlePartsWithMetadata;
}

export { getTitleParts };
