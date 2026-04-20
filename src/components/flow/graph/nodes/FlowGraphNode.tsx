import type { ReactNode } from "react";
import { Link } from "react-router";

import { CommitMessage } from "src/components/commitmessage/CommitMessage.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { Timestamp } from "src/components/timestamp/Timestamp.tsx";
import type { NodePhase } from "src/data/types/workflowTypes.ts";
import { NodePhases } from "src/data/types/workflowTypes.ts";
import {
  getDisplayCommit,
  getRepoAuthorLink,
  getRepoCommitLink,
  getRepoPrLink,
  getRepoTreeLink,
  trimBranchPrefix,
} from "src/utils/gitUtil.ts";
import type { WorkflowNode } from "src/utils/workflowUtil.ts";
import {
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionNumber,
  getWorkflowRevisionRef,
  getWorkflowRevisionTitle,
} from "src/utils/workflowUtil.ts";

/**
 * Returns the html content for the FlowGraphNode.
 * This gets rendered inside of an svg
 */
interface FlowGraphNodeProps {
  headerClass: string | undefined;
  headerLink: string;
  titleIcon: string;
  titleText: string;
  children?: ReactNode;
}
function FlowGraphNode({
  headerClass,
  headerLink,
  titleIcon,
  titleText,
  children,
}: FlowGraphNodeProps) {
  return (
    <div
      // @ts-expect-error Since this is the root html element inside the svg, xmlns
      // should be set. However, this is not supported in ts currently
      // See https://stackoverflow.com/questions/39504988/react-svg-html-inside-foreignobject-not-rendered
      xmlns="http://www.w3.org/1999/xhtml"
    >
      <Link to={headerLink} className={headerClass}>
        <i className={titleIcon}></i>
        <span className={styles.nodeTitle}>{titleText}</span>
      </Link>
      {children}
    </div>
  );
}

interface FlowGraphNodeInfoProps {
  isPrFlow: boolean;
  workflowNode: WorkflowNode;
}
function FlowGraphNodeInfo({ isPrFlow, workflowNode }: FlowGraphNodeInfoProps) {
  const { workflow, node } = workflowNode;
  const { parameterMap } = workflow.memo;

  const repoUrl = getWorkflowRepo(parameterMap);
  const commitText = getWorkflowRevisionTitle(parameterMap);
  const commitAuthor = getWorkflowRevisionAuthor(parameterMap);
  const commitSha = getWorkflowRevision(parameterMap);
  const branchRef = getWorkflowRevisionRef(parameterMap);

  const displayCommit = getDisplayCommit(commitSha);
  const commitLink = getRepoCommitLink(repoUrl, commitSha);
  const branch = trimBranchPrefix(branchRef);
  const authorLink = getRepoAuthorLink(repoUrl, branch, commitAuthor);
  const branchLink = getRepoTreeLink(repoUrl, branch);

  return (
    <>
      <div className={styles.nodeRowBlock}>
        <CommitMessage
          isPrFlow={isPrFlow}
          commitLink={commitLink}
          title={commitText}
          repoUrl={repoUrl}
        />
      </div>
      <div className={styles.nodeRowSub}>
        <FlowGraphStatusIcon nodePhase={node.phase} />
        <a
          className={styles.codeText}
          href={commitLink}
          target="_blank"
          rel="noreferrer"
        >
          {displayCommit}
        </a>
        <i className={`nf nf-fa-user_o ${styles.userIcon}`} />
        <a
          className={styles.nodeLinkSub}
          href={authorLink}
          target="_blank"
          rel="noreferrer"
        >
          {commitAuthor}
        </a>
      </div>
      <div className={styles.nodeRowSub}>
        {isPrFlow && (
          <>
            <i className={`nf nf-md-source_pull ${styles.prIcon}`} />
            <a
              className={styles.prText}
              href={getRepoPrLink(
                repoUrl,
                getWorkflowRevisionNumber(parameterMap),
              )}
              target="_blank"
              rel="noreferrer"
            >
              #{getWorkflowRevisionNumber(parameterMap)}
            </a>
          </>
        )}
        <i className={`nf nf-fa-code_branch ${styles.branchIcon}`} />
        <a
          className={styles.nodeLinkSub}
          href={branchLink}
          target="_blank"
          rel="noreferrer"
        >
          {branch}
        </a>
      </div>
      <div className={styles.nodeRowSub}>
        <i className="nf nf-fa-calendar_o" />
        <Timestamp className={styles.nodeTimeText} date={node.startedAt} />
      </div>
    </>
  );
}

interface FlowGraphStatusIconProps {
  nodePhase: NodePhase;
}

function FlowGraphStatusIcon({ nodePhase }: FlowGraphStatusIconProps) {
  switch (nodePhase) {
    case NodePhases.Succeeded:
      return <i className="nf nf-fa-code_commit" />;
    case NodePhases.Error:
      return <i className={`nf nf-md-cancel ${styles.dangerIcon}`} />;
    case NodePhases.Failed:
      return <i className={`nf nf-fa-circle_xmark ${styles.dangerIcon}`} />;
    case NodePhases.Running:
      return <LoadIcon className={styles.loadingIcon} />;
    case NodePhases.Pending:
      return <i className={`nf nf-fa-hourglass ${styles.pendingIcon}`} />;
    case NodePhases.Skipped:
    case NodePhases.Omitted:
      throw new FlowGraphNodeError(
        `invalid node phase for status icon: ${nodePhase}`,
      );
    default:
      nodePhase satisfies never;
      console.log("unknown node phase:");
      console.log(nodePhase);
      throw new FlowGraphNodeError("unknown node phase");
  }
}

class FlowGraphNodeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

function FlowGraphLoading() {
  return (
    <div className={styles.nodeRowSub}>
      <LoadIcon className={styles.loadIcon} />
      <span className={styles.nodeTextSub}>Waiting for workflow run</span>
    </div>
  );
}

export { FlowGraphLoading, FlowGraphNode, FlowGraphNodeInfo };
