import { useContext } from "react";
import { Link } from "react-router";

import {
  ApplicationsContext,
  RolloutsContext,
} from "src/providers/provider.tsx";
import { getRepoCommitLink } from "src/utils/gitUtil.ts";
import { FlowGraphNode } from "src/components/flow/graph/nodes/FlowGraphNode.tsx";
import styles from "src/components/flow/graph/nodes/FlowGraphNode.module.css";
import {
  getDisplayRepoName,
  getDisplayRepoPath,
  getStepDetailsLink,
} from "src/components/flow/graph/nodes/graphNodeUtil.ts";
import type { ArgoCDStep, Trigger } from "src/data/types/flowTypes.ts";
import { ResourceKind } from "src/data/types/baseResourceTypes.ts";
import { getDisplayCommit } from "src/utils/gitUtil.ts";

const SYNCED_STATUS = "Synced";
const HEALTHY_STATUS = "Healthy";
const APP_VERSION_LABEL = "app.kubernetes.io/version";

interface FlowGraphArgoCDStepProps {
  namespace: string;
  flowName: string;
  step: ArgoCDStep;
  trigger: Trigger;
}
function FlowGraphArgoCDStep({
  namespace,
  flowName,
  step,
  trigger,
}: FlowGraphArgoCDStepProps) {
  const { repoUrl, repoPath } = step;
  const displayRepoName = getDisplayRepoName(repoUrl);
  const displayRepoPath = getDisplayRepoPath(repoPath, repoPath);
  const stepDetailsLink = getStepDetailsLink(namespace, flowName, step);

  return (
    <FlowGraphNode>
      <Link to={stepDetailsLink} className={styles.nodeLink}>
        <i
          className={`nf nf-dev-argocd ${styles.nodeIcon} ${styles.argoIcon}`}
        ></i>
        <div className={styles.nodeTextLine}>{displayRepoName}</div>
        <div className={styles.nodeTextLineBolder}>{displayRepoPath}</div>
        <FlowGraphArgoCDStepStatus step={step} trigger={trigger} />
      </Link>
    </FlowGraphNode>
  );
}

interface FlowGraphArgoCDStepStatusProps {
  step: ArgoCDStep;
  trigger: Trigger;
}
function FlowGraphArgoCDStepStatus({
  step,
  trigger,
}: FlowGraphArgoCDStepStatusProps) {
  const { repoUrl, repoPath } = step;
  const applications = useContext(ApplicationsContext);
  const rollouts = useContext(RolloutsContext);

  /* Handle loading state */
  const application = applications?.get(repoUrl)?.get(repoPath);
  if (application == null) {
    return (
      <div className={styles.nodeTextLineCode}>
        <i className="nf nf-fa-spinner" />
      </div>
    );
  }

  let healthError;
  let applicationVersion;

  const { status: healthStatus } = application.status.health;
  const { status: syncStatus } = application.status.sync;
  if (healthStatus !== HEALTHY_STATUS) {
    healthError = `ArgoCD health status is ${healthStatus}`;
  } else if (syncStatus !== SYNCED_STATUS) {
    healthError = `ArgoCD sync status is ${syncStatus}`;
  }

  for (const resource of application.status.resources) {
    if (resource.kind === ResourceKind.Rollout.valueOf()) {
      const { namespace, name } = resource;
      const rollout = rollouts?.get(namespace)?.get(name);
      if (rollout == null) {
        // Currently, rollout is considered as loading if not present
        continue;
      }
      if (rollout.status.phase !== HEALTHY_STATUS) {
        healthError = `Rollout status is ${rollout.status.phase}`;
      }
      const rolloutVersion = rollout.metadata.labels?.[APP_VERSION_LABEL];
      if (!rolloutVersion) {
        throw new FlowGraphArgoCDStepError(
          `Rollout is missing version label namespace=${namespace} name=${name}`,
        );
      }
      if (applicationVersion != null && applicationVersion !== rolloutVersion) {
        throw new FlowGraphArgoCDStepError(
          `Rollout versions are inconsistent namespace=${namespace} name=${name}`,
        );
      }
      applicationVersion = rolloutVersion;
    }
  }

  if (healthError) {
    return (
      <div className={styles.nodeTextLineCode} title={healthError}>
        <i className={`nf nf-fa-warning ${styles.dangerIcon}`} />
        <FlowGraphArgoCDStepVersion
          applicationVersion={applicationVersion}
          trigger={trigger}
        />
      </div>
    );
  }

  return (
    <div className={styles.nodeTextLineCode}>
      <i className={`nf nf-fa-check_circle ${styles.successIcon}`} />
      <FlowGraphArgoCDStepVersion
        applicationVersion={applicationVersion}
        trigger={trigger}
      />
    </div>
  );
}

interface FlowGraphArgoCDStepVersionProps {
  applicationVersion?: string;
  trigger: Trigger;
}
function FlowGraphArgoCDStepVersion({
  applicationVersion,
  trigger,
}: FlowGraphArgoCDStepVersionProps) {
  if (!applicationVersion) {
    return "Loading...";
  }
  const commitLink = getRepoCommitLink(trigger.repoUrl, applicationVersion);
  return (
    <a
      className={styles.commitLink}
      href={commitLink}
      target="_blank"
      rel="noreferrer"
    >
      {getDisplayCommit(applicationVersion)}
    </a>
  );
}

class FlowGraphArgoCDStepError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { FlowGraphArgoCDStep };
