import { Link } from "react-router";

import styles from "src/components/repos/Repo.module.css";
import { pushTriggerRoute, routes } from "src/routes.ts";
import { getRepoLink, getRepoOrgAndName } from "src/utils/gitUtil.ts";

interface RepoProps {
  repoOrgName: string;
  isFirst: boolean;
}
function Repo({ repoOrgName, isFirst }: RepoProps) {
  const [repoOrg, repoName] = getRepoOrgAndName(repoOrgName);
  const repoClassName = isFirst ? styles.repoFirst : styles.repo;
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

export { Repo };
