import type { JSX } from "react";
import { useContext } from "react";
import { Link } from "react-router";

import { Header } from "src/components/header/Header.tsx";
import { HomeNavHeader } from "src/components/header/NavHeader.tsx";
import styles from "src/components/home/Home.module.css";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { Repo } from "src/components/repos/Repo.tsx";
import type { Application } from "src/data/types/applicationTypes.ts";
import type { PushPrFlows } from "src/data/types/flowTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { localState } from "src/localState.ts";
import {
  ApplicationsContext,
  FlowsContext,
  RolloutsContext,
  WorkflowsContext,
} from "src/providers/provider.tsx";
import { routes } from "src/routes.ts";
import { getPushPrWorkflows } from "src/utils/flowUtil.ts";
import { getRepoOrgAndName } from "src/utils/gitUtil.ts";

function Home(): JSX.Element {
  const flows = useContext(FlowsContext);
  const workflows = useContext(WorkflowsContext);
  return (
    <>
      <Header />
      <HomeNavHeader />
      <Overview flows={flows} workflows={workflows} />
      <RecentRepos flows={flows} workflows={workflows} />
    </>
  );
}

interface OverviewProps {
  flows: Map<string, PushPrFlows> | null;
  workflows: Map<string, Map<string, Map<string, Workflow>>> | null;
}
function Overview({ flows, workflows }: OverviewProps): JSX.Element {
  const applications = useContext(ApplicationsContext);
  const rollouts = useContext(RolloutsContext);
  return (
    <>
      <h2 className={styles.firstSectionTitle}>Overview</h2>
      <ul className={styles.overviewContainer}>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Repos</label>{" "}
          <NumRepos flows={flows} />
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Flows</label>{" "}
          <NumFlows flows={flows} />
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Triggers</label>{" "}
          <NumTriggers flows={flows} />
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Steps</label>{" "}
          <NumSteps flows={flows} />
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Applications</label>{" "}
          <NumApplications applications={applications} />
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Rollouts</label>{" "}
          <NumRollouts rollouts={rollouts} />
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Workflows</label>{" "}
          <NumWorkflows workflows={workflows} />
        </li>
      </ul>
      <Link className={styles.namespacesLink} to={routes.flows}>
        See All Repos <i className="nf nf-fa-angle_right" />
      </Link>
    </>
  );
}

interface RecentRepoProps {
  flows: Map<string, PushPrFlows> | null;
  workflows: Map<string, Map<string, Map<string, Workflow>>> | null;
}
function RecentRepos({ flows, workflows }: RecentRepoProps): JSX.Element {
  const recentRepos = localState.getRecentRepos();
  if (recentRepos.length === 0) {
    return (
      <>
        <h2 className={styles.sectionTitle}>Recent Repos</h2>
        <p>No recent repos found</p>
      </>
    );
  }
  return (
    <>
      <h2 className={styles.sectionTitle}>Recent Repos</h2>
      {recentRepos.map((recentRepo) => {
        const [repoOrg, repoName] = getRepoOrgAndName(recentRepo);
        const [pushWorkflows, prWorkflows] = getPushPrWorkflows(
          flows,
          workflows,
          recentRepo,
          repoOrg,
        );

        return (
          <Repo
            key={recentRepo}
            repoOrg={repoOrg}
            repoName={repoName}
            pushWorkflows={pushWorkflows}
            prWorkflows={prWorkflows}
          />
        );
      })}
    </>
  );
}

interface FlowsProp {
  flows: Map<string, PushPrFlows> | null;
}
function NumRepos({ flows }: FlowsProp): JSX.Element | number {
  if (flows == null) {
    return <LoadIcon />;
  }
  return flows.size;
}

function NumFlows({ flows }: FlowsProp): JSX.Element | number {
  if (flows == null) {
    return <LoadIcon />;
  }
  return flows.size * 2;
}

function NumTriggers({ flows }: FlowsProp): JSX.Element | number {
  if (flows == null) {
    return <LoadIcon />;
  }
  return flows.size * 2;
}

function NumSteps({ flows }: FlowsProp): JSX.Element | number {
  if (flows == null) {
    return <LoadIcon />;
  }
  let numSteps = 0;
  for (const pushPrFlows of flows.values()) {
    const { pushFlow, prFlow } = pushPrFlows;
    if (pushFlow != null) {
      numSteps += pushFlow.spec.steps.length;
    }
    if (prFlow != null) {
      numSteps += prFlow.spec.steps.length;
    }
  }
  return numSteps;
}

interface ApplicationsProp {
  applications: Map<string, Map<string, Application>> | null;
}
function NumApplications({
  applications,
}: ApplicationsProp): JSX.Element | number {
  if (applications == null) {
    return <LoadIcon />;
  }
  let numApplications = 0;
  for (const namespaceApplications of applications.values()) {
    numApplications += namespaceApplications.size;
  }
  return numApplications;
}

interface RolloutsProp {
  rollouts: Map<string, Map<string, Rollout>> | null;
}
function NumRollouts({ rollouts }: RolloutsProp): JSX.Element | number {
  if (rollouts == null) {
    return <LoadIcon />;
  }
  let numRollouts = 0;
  for (const namespaceRollouts of rollouts.values()) {
    numRollouts += namespaceRollouts.size;
  }
  return numRollouts;
}

interface WorkflowsProp {
  workflows: Map<string, Map<string, Map<string, Workflow>>> | null;
}
function NumWorkflows({ workflows }: WorkflowsProp): JSX.Element | number {
  if (workflows == null) {
    return <LoadIcon />;
  }
  let numWorkflows = 0;
  for (const namespaceWorkflows of workflows.values()) {
    for (const flowWorkflows of namespaceWorkflows.values()) {
      numWorkflows += flowWorkflows.size;
    }
  }
  return numWorkflows;
}

export { Home };
