import { useContext } from "react";
import { Link } from "react-router";

import { routes, pushTriggerRoute } from "src/routes.ts";
import { localState } from "src/localState.ts";
import type { PushPrFlows } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { Header } from "src/components/header/Header.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { HomeNavHeader } from "src/components/header/NavHeader.tsx";
import { getRepoOrgAndName, getRepoLink } from "src/utils/gitUtil.ts";
import styles from "src/components/home/Home.module.css";
import {
  FlowsContext,
  ApplicationsContext,
  RolloutsContext,
  WorkflowsContext,
} from "src/providers/provider.tsx";

function Home() {
  return (
    <>
      <Header />
      <HomeNavHeader />
      <Overview />
      <RecentRepos />
    </>
  );
}

function Overview() {
  const flows = useContext(FlowsContext);
  const applications = useContext(ApplicationsContext);
  const rollouts = useContext(RolloutsContext);
  const workflows = useContext(WorkflowsContext);
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

function RecentRepos() {
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
      {recentRepos.map((recentRepo, index) => (
        <RecentRepo
          key={recentRepo}
          isFirst={index === 0}
          recentRepo={recentRepo}
        />
      ))}
    </>
  );
}

interface RecentRepoProps {
  recentRepo: string;
  isFirst: boolean;
}
function RecentRepo({ recentRepo, isFirst }: RecentRepoProps) {
  const [repoOrg, repoName] = getRepoOrgAndName(recentRepo);
  let recentRepoClassName = styles.recentRepo;
  if (recentRepoClassName == null) {
    throw new HomeError("failed to find recentRepo style");
  }
  if (isFirst) {
    recentRepoClassName += ` ${styles.recentRepoFirst}`;
  }
  return (
    <div className={recentRepoClassName}>
      <Link
        to={`${routes.flows}/${repoOrg}/${repoName}/${pushTriggerRoute}`}
        className={styles.recentRepoLink}
      ></Link>
      {repoName}
      <a
        className={styles.manifestLink}
        href={getRepoLink(repoOrg, repoName)}
        target="_blank"
        rel="noreferrer"
      >
        <i className="nf nf-fa-github" />
      </a>
    </div>
  );
}

interface FlowsProp {
  flows: Map<string, PushPrFlows> | null;
}
function NumRepos({ flows }: FlowsProp) {
  if (flows == null) {
    return <LoadIcon />;
  }
  return flows.size;
}

function NumFlows({ flows }: FlowsProp) {
  if (flows == null) {
    return <LoadIcon />;
  }
  return flows.size * 2;
}

function NumTriggers({ flows }: FlowsProp) {
  if (flows == null) {
    return <LoadIcon />;
  }
  return flows.size * 2;
}

function NumSteps({ flows }: FlowsProp) {
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
function NumApplications({ applications }: ApplicationsProp) {
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
function NumRollouts({ rollouts }: RolloutsProp) {
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
function NumWorkflows({ workflows }: WorkflowsProp) {
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

class HomeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export { Home };
