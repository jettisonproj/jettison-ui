import { useContext } from "react";
import { Link } from "react-router";

import { routes, pushTriggerRoute } from "src/routes.ts";
import { Header } from "src/components/header/Header.tsx";
import { ReposNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { FlowsContext } from "src/providers/provider.tsx";
import { concatStyles } from "src/utils/styleUtil.ts";
import styles from "src/components/repos/Repos.module.css";
import {
  getRepoOrgAndName,
  getRepoLink,
  sortByRepoName,
} from "src/utils/gitUtil.ts";

function Repos() {
  return (
    <>
      <Header />
      <ReposNavHeader />
      <ReposList />
    </>
  );
}

function ReposList() {
  const flows = useContext(FlowsContext);

  if (flows == null) {
    return <LoadIcon />;
  }

  return Array.from(flows.keys())
    .sort(sortByRepoName)
    .map((repoOrgName, index) => (
      <Repo key={repoOrgName} isFirst={index === 0} repoOrgName={repoOrgName} />
    ));
}

interface RepoProps {
  repoOrgName: string;
  isFirst: boolean;
}
function Repo({ repoOrgName, isFirst }: RepoProps) {
  const repoClassName = concatStyles(styles.repo, styles.repoFirst, isFirst);
  const [repoOrg, repoName] = getRepoOrgAndName(repoOrgName);
  return (
    <div className={repoClassName}>
      <Link
        to={`${routes.flows}/${repoOrg}/${repoName}/${pushTriggerRoute}`}
        className={styles.repoLink}
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

export { Repos };
