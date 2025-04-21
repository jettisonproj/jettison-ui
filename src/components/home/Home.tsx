import { useContext } from "react";
import { Link } from "react-router";

import { routes } from "src/routes.ts";
import { localState } from "src/localState.ts";
import { Content } from "src/components/content/Content.tsx";
import type { Flow } from "src/data/types/flowTypes.ts";
import { Header } from "src/components/header/Header.tsx";
import { HomeNavHeader } from "src/components/header/NavHeader.tsx";
import styles from "src/components/home/Home.module.css";
import { FlowsContext, NamespacesContext } from "src/providers/provider.tsx";

function Home() {
  return (
    <>
      <Header />
      <Content>
        <HomeNavHeader />
        <Overview />
        <RecentFlows />
      </Content>
    </>
  );
}

function Overview() {
  const namespaces = useContext(NamespacesContext);
  const flows = useContext(FlowsContext);
  return (
    <>
      <h2>Overview</h2>
      <div className={styles.overviewContainer}>
        <p>
          <label className={styles.overviewLabel}>Namespaces</label>{" "}
          <NumNamespaces namespaces={namespaces} />
        </p>
        <p>
          <label className={styles.overviewLabel}>Flows</label>{" "}
          <NumFlows flows={flows} />
        </p>
        <p>
          <label className={styles.overviewLabel}>Triggers</label>{" "}
          <NumTriggers flows={flows} />
        </p>
        <p>
          <label className={styles.overviewLabel}>Steps</label>{" "}
          <NumSteps flows={flows} />
        </p>
        <Link to={routes.flows}>
          See All Namespaces <i className="nf nf-fa-angle-right" />
        </Link>
      </div>
    </>
  );
}

function RecentFlows() {
  const recentFlows = localState.getRecentFlows();
  if (recentFlows.length === 0) {
    return (
      <>
        <h2 className={styles.sectionTitle}>Recent Flows</h2>
        <ul>
          <li>No recent flows found</li>
        </ul>
      </>
    );
  }
  return (
    <>
      <h2 className={styles.sectionTitle}>Recent Flows</h2>
      <ul>
        {recentFlows.map((recentFlow) => (
          <li key={recentFlow}>
            <Link to={`${routes.flows}/${recentFlow}`}>{recentFlow}</Link>
          </li>
        ))}
      </ul>
    </>
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

export { Home };
