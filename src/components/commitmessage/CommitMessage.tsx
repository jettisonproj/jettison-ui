import type { JSX } from "react";

import styles from "src/components/commitmessage/CommitMessage.module.css";
import type { TitlePart } from "src/components/commitmessage/getTitleParts.ts";
import {
  getTitleParts,
  TitlePartTypes,
} from "src/components/commitmessage/getTitleParts.ts";
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
  return getTitleParts(title).map((titlePart, i) => (
    <CommitMessagePart
      key={i}
      repoUrl={repoUrl}
      titlePart={titlePart}
      commitLink={commitLink}
    />
  ));
}

interface CommitMessagePartProps {
  repoUrl: string;
  titlePart: TitlePart;
  commitLink: string;
}
function CommitMessagePart({
  repoUrl,
  titlePart,
  commitLink,
}: CommitMessagePartProps): JSX.Element {
  const { titlePartText, titlePartType } = titlePart;
  switch (titlePartType) {
    case TitlePartTypes.prText: {
      const prNumber = titlePartText.substring(1);
      const prLink = getRepoPrLink(repoUrl, prNumber);
      return (
        <a
          href={prLink}
          target="_blank"
          rel="noreferrer"
          className={styles.prMessageText}
        >
          {titlePartText}
        </a>
      );
    }
    case TitlePartTypes.regularText: {
      return (
        <a
          href={commitLink}
          target="_blank"
          rel="noreferrer"
          className={styles.commitMessageText}
        >
          {titlePartText}
        </a>
      );
    }
    case TitlePartTypes.backtickText: {
      return (
        <a
          href={commitLink}
          target="_blank"
          rel="noreferrer"
          className={styles.backtickMessageText}
        >
          {titlePartText}
        </a>
      );
    }
    default:
      titlePartType satisfies never;
      console.log("unknown title part type");
      console.log(titlePartType);
      throw new CommitMessageError("unexpected tab selected");
  }
}

class CommitMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { CommitMessage };
