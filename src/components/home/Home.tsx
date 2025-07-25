import { useContext } from "react";
import { Link } from "react-router";

import { routes } from "src/routes.ts";
import { localState } from "src/localState.ts";
import type { Flow } from "src/data/types/flowTypes.ts";
import type { Application } from "src/data/types/applicationTypes.ts";
import type { Rollout } from "src/data/types/rolloutTypes.ts";
import type { Workflow } from "src/data/types/workflowTypes.ts";
import { Header } from "src/components/header/Header.tsx";
import { HomeNavHeader } from "src/components/header/NavHeader.tsx";
import styles from "src/components/home/Home.module.css";
import {
  FlowsContext,
  NamespacesContext,
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
      <RecentFlows />
    </>
  );
}

function Overview() {
  const namespaces = useContext(NamespacesContext);
  const flows = useContext(FlowsContext);
  const applications = useContext(ApplicationsContext);
  const rollouts = useContext(RolloutsContext);
  const workflows = useContext(WorkflowsContext);
  return (
    <>
      <h2 className={styles.firstSectionTitle}>Overview</h2>
      <ul className={styles.overviewContainer}>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Namespaces</label>{" "}
          <div className={styles.overviewValue}>
            <NumNamespaces namespaces={namespaces} />
          </div>
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Flows</label>{" "}
          <div className={styles.overviewValue}>
            <NumFlows flows={flows} />
          </div>
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Triggers</label>{" "}
          <div className={styles.overviewValue}>
            <NumTriggers flows={flows} />
          </div>
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Steps</label>{" "}
          <div className={styles.overviewValue}>
            <NumSteps flows={flows} />
          </div>
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Applications</label>{" "}
          <div className={styles.overviewValue}>
            <NumApplications applications={applications} />
          </div>
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Rollouts</label>{" "}
          <div className={styles.overviewValue}>
            <NumRollouts rollouts={rollouts} />
          </div>
        </li>
        <li className={styles.overviewItem}>
          <label className={styles.overviewLabel}>Workflows</label>{" "}
          <div className={styles.overviewValue}>
            <NumWorkflows workflows={workflows} />
          </div>
        </li>
      </ul>
      <Link className={styles.namespacesLink} to={routes.flows}>
        See All Namespaces <i className="nf nf-fa-angle_right" />
      </Link>
    </>
  );
}

function RecentFlows() {
  const recentFlows = localState.getRecentFlows();
  if (recentFlows.length === 0) {
    return (
      <>
        <h2 className={styles.sectionTitle}>Recent Flows</h2>
        <p>No recent flows found</p>
      </>
    );
  }
  return (
    <>
      <h2 className={styles.sectionTitle}>Recent Flows</h2>
      {recentFlows.map((recentFlow, index) => (
        <RecentFlow
          key={recentFlow}
          isFirst={index === 0}
          recentFlow={recentFlow}
        />
      ))}
    </>
  );
}

interface RecentFlowProps {
  recentFlow: string;
  isFirst: boolean;
}
function RecentFlow({ recentFlow, isFirst }: RecentFlowProps) {
  const recentFlowParts = recentFlow.split("/");
  if (recentFlowParts.length !== 2) {
    throw new HomeError(`unexpected recent flow: ${recentFlow}`);
  }
  const [namespace, name] = recentFlowParts;
  let recentFlowClassName = styles.recentFlow;
  if (recentFlowClassName == null) {
    throw new HomeError("failed to find recentFlow style");
  }
  if (isFirst) {
    recentFlowClassName += ` ${styles.recentFlowFirst}`;
  }
  return (
    <div className={recentFlowClassName}>
      <Link
        to={`${routes.flows}/${recentFlow}`}
        className={styles.recentFlowLink}
      ></Link>
      {recentFlow}
      <a
        className={styles.manifestLink}
        href={`http://osoriano.com:2846/api/v1/namespaces/${namespace}/flows/${name}`}
        target="_blank"
        rel="noreferrer"
      >
        <i className="nf nf-fa-file_text_o" />
      </a>
    </div>
  );
}

interface NamespacesProp {
  namespaces: Set<string> | null;
}
function NumNamespaces({ namespaces }: NamespacesProp) {
  if (namespaces == null) {
    return <i className="nf nf-fa-spinner" />;
  }
  return namespaces.size;
}

interface FlowsProp {
  flows: Map<string, Map<string, Flow>> | null;
}
function NumFlows({ flows }: FlowsProp) {
  if (flows == null) {
    return <i className="nf nf-fa-spinner" />;
  }
  let numFlows = 0;
  for (const namespaceFlows of flows.values()) {
    numFlows += namespaceFlows.size;
  }
  return numFlows;
}

function NumTriggers({ flows }: FlowsProp) {
  if (flows == null) {
    return <i className="nf nf-fa-spinner" />;
  }
  let numTriggers = 0;
  for (const namespaceFlows of flows.values()) {
    for (const flow of namespaceFlows.values()) {
      numTriggers += flow.spec.triggers.length;
    }
  }
  return numTriggers;
}

function NumSteps({ flows }: FlowsProp) {
  if (flows == null) {
    return <i className="nf nf-fa-spinner" />;
  }
  let numSteps = 0;
  for (const namespaceFlows of flows.values()) {
    for (const flow of namespaceFlows.values()) {
      numSteps += flow.spec.steps.length;
    }
  }
  return numSteps;
}

interface ApplicationsProp {
  applications: Map<string, Map<string, Application>> | null;
}
function NumApplications({ applications }: ApplicationsProp) {
  if (applications == null) {
    return <i className="nf nf-fa-spinner" />;
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
    return <i className="nf nf-fa-spinner" />;
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
    return <i className="nf nf-fa-spinner" />;
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
