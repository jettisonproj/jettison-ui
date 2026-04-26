import { useContext } from "react";

import { Header } from "src/components/header/Header.tsx";
import { ReposNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { Repo } from "src/components/repos/Repo.tsx";
import { FlowsContext } from "src/providers/provider.tsx";
import { sortByRepoName } from "src/utils/gitUtil.ts";

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

export { Repos };
