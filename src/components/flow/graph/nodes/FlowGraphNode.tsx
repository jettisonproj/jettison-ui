import { ReactNode } from "react";
import { Link } from "react-router";

import {
  trimBranchPrefix,
  getDisplayCommit,
  getRepoCommitLink,
  getRepoPrLink,
} from "src/utils/gitUtil.ts";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  getWorkflowRepo,
  getWorkflowRevision,
  getWorkflowRevisionRef,
  getWorkflowRevisionTitle,
  getWorkflowRevisionAuthor,
  getWorkflowRevisionNumber,
} from "src/components/flow/workflowNodeUtil.ts";
import type {
  Workflow,
  WorkflowMemoStatusNode,
} from "src/data/types/workflowTypes.ts";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { Timestamp } from "src/components/timestamp/Timestamp.tsx";

/**
 * Returns the html content for the FlowGraphNode.
 * This gets rendered inside of an svg
 */
interface FlowGraphNodeProps {
  headerLink: string;
  titleIcon: string;
  titleText: string;
  children: ReactNode;
}
function FlowGraphNode({
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
      <Link to={headerLink} className={styles.nodeRowHeader}>
        <i className={titleIcon}></i>
        <span className={styles.nodeTitle}>{titleText}</span>
      </Link>
      {children}
    </div>
  );
}

interface FlowGraphCommitProps {
  isPrFlow: boolean;
  workflow: Workflow;
}
function FlowGraphCommit({ isPrFlow, workflow }: FlowGraphCommitProps) {
  const { parameterMap } = workflow.memo;

  const repoUrl = getWorkflowRepo(parameterMap);
  const commitText = getWorkflowRevisionTitle(parameterMap);
  const commitAuthor = getWorkflowRevisionAuthor(parameterMap);

  let commitSha;
  let prNumber;
  let commitLink;
  let branch;
  if (isPrFlow) {
    prNumber = getWorkflowRevisionNumber(parameterMap);
    commitLink = getRepoPrLink(repoUrl, prNumber);
  } else {
    commitSha = getWorkflowRevision(parameterMap);
    commitLink = getRepoCommitLink(repoUrl, commitSha);
    commitSha = getDisplayCommit(commitSha);
    branch = getWorkflowRevisionRef(parameterMap);
    branch = trimBranchPrefix(branch);
  }
  return (
    <>
      <a
        className={styles.nodeRowLink}
        href={commitLink}
        target="_blank"
        rel="noreferrer"
      >
        {commitSha && (
          <>
            <i className={`nf nf-fa-code ${styles.commitIcon}`} />
            <span className={styles.nodeText}>{commitText}</span>
          </>
        )}
        {prNumber && (
          <>
            <i className={`nf nf-md-source_pull ${styles.prIcon}`} />
            <span className={styles.nodeText}>{commitText}</span>
            <span className={styles.prNumberText}>(#{prNumber})</span>
          </>
        )}
      </a>
      <div className={styles.nodeRowText}>
        {commitSha && (
          <>
            <i className={`nf nf-fa-code_commit ${styles.shaIcon}`} />
            <span className={styles.codeText}>{commitSha}</span>
          </>
        )}
        <i className={`nf nf-fa-user ${styles.userIcon}`} />
        <span className={styles.codeText}>{commitAuthor}</span>
        {branch && (
          <>
            <i className={`nf nf-fa-code_branch ${styles.branchIcon}`} />
            <span className={styles.codeText}>{branch}</span>
          </>
        )}
      </div>
    </>
  );
}

interface FlowGraphTimestampProps {
  node: WorkflowMemoStatusNode;
}
function FlowGraphTimestamp({ node }: FlowGraphTimestampProps) {
  return (
    <div className={styles.nodeRowSmall}>
      <i className={`nf nf-fa-clock ${styles.timeIcon}`} />
      <Timestamp className={styles.nodeTimeText} date={node.startedAt} />
      <FlowGraphPhase phase={node.phase} />
    </div>
  );
}

interface FlowGraphPhaseProps {
  phase: string;
}
function FlowGraphPhase({ phase }: FlowGraphPhaseProps) {
  switch (phase) {
    // todo handle more cases
    // See https://pkg.go.dev/github.com/argoproj/argo-workflows/v3@v3.7.0/pkg/apis/workflow/v1alpha1#NodePhase
    case "Succeeded":
      return null;
    case "Error":
      return <i className={`nf nf-md-cancel ${styles.nodeDangerIcon}`} />;
    case "Failed":
      return <i className={`nf nf-fa-warning ${styles.nodeDangerIcon}`} />;
    case "Running":
      return <LoadIcon />;
    case "Pending":
      return <i className="nf nf-fa-hourglass" />;
    default:
      return <i className="nf nf-fa-question_circle" />;
  }
}

function FlowGraphLoading() {
  return (
    <div className={styles.nodeRowSmall}>
      <LoadIcon className={styles.loadingIcon} />
      <span className={styles.nodeSmallText}>Waiting for workflow run</span>
    </div>
  );
}

export { FlowGraphNode, FlowGraphCommit, FlowGraphTimestamp, FlowGraphLoading };
