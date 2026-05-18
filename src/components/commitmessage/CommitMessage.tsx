import type { JSX } from "react";

import styles from "src/components/commitmessage/CommitMessage.module.css";
import { getTitleParts } from "src/components/commitmessage/getTitleParts.ts";
import { getRepoPrLink } from "src/utils/gitUtil.ts";

interface CommitMessageProps {
  isPrFlow: boolean;
  commitLink: string;
  title: string;
  repoUrl: string;
}
function CommitMessage({
  isPrFlow,
  commitLink,
  title,
  repoUrl,
}: CommitMessageProps): JSX.Element | JSX.Element[] {
  if (isPrFlow) {
    // No transformation of pr commit message link
    return (
      <a
        href={commitLink}
        target="_blank"
        rel="noreferrer"
        className={styles.commitMessageText}
      >
        {title}
      </a>
    );
  }

  // For non-pr commit messages, parse the pr number and link to it
  return getTitleParts(title).map(({ titlePart, isPrNumber }, i) => (
    <CommitMessagePart
      key={i}
      repoUrl={repoUrl}
      titlePart={titlePart}
      commitLink={commitLink}
      isPrNumber={isPrNumber}
    />
  ));
}

interface CommitMessagePartProps {
  repoUrl: string;
  titlePart: string;
  commitLink: string;
  isPrNumber: boolean;
}
function CommitMessagePart({
  repoUrl,
  titlePart,
  commitLink,
  isPrNumber,
}: CommitMessagePartProps): JSX.Element {
  if (isPrNumber) {
    const prNumber = titlePart.substring(1);
    const prLink = getRepoPrLink(repoUrl, prNumber);
    return (
      <a
        href={prLink}
        target="_blank"
        rel="noreferrer"
        className={styles.prMessageText}
      >
        {titlePart}
      </a>
    );
  }
  return (
    <a
      href={commitLink}
      target="_blank"
      rel="noreferrer"
      className={styles.commitMessageText}
    >
      {titlePart}
    </a>
  );
}

export { CommitMessage };
