import { Link } from "react-router";

import { recentFlows, stats } from "src/data/data.ts";
import { Content } from "src/components/content/Content.tsx";
import { Header } from "src/components/header/Header.tsx";
import styles from "src/components/home/Home.module.css";

function Home() {
  return (
    <>
      <Header />
      <Content title="Home">
        <Overview />
        <RecentFlows />
      </Content>
    </>
  );
}

function Overview() {
  return (
    <>
      <h2>Overview</h2>
      <div className={styles.overviewContainer}>
        <p>
          <label className={styles.overviewLabel}>Namespaces</label>{" "}
          {stats.namespaces}
        </p>
        <p>
          <label className={styles.overviewLabel}>Flows</label> {stats.flows}
        </p>
        <p>
          <label className={styles.overviewLabel}>Triggers</label>{" "}
          {stats.triggers}
        </p>
        <p>
          <label className={styles.overviewLabel}>Steps</label> {stats.steps}
        </p>
        <Link to="flows">
          See All Namespaces <i className="fa fa-lg fa-angle-right" />
        </Link>
      </div>
    </>
  );
}

function RecentFlows() {
  return (
    <>
      <h2 className={styles.sectionTitle}>Recent Flows</h2>
      <ul className={styles.recentFlowsContainer}>
        {recentFlows.map((recentFlow) => (
          <li key={recentFlow}>
            <Link to={`flows/${recentFlow}`}>{recentFlow}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export { Home };
