import { useContext } from "react";

import { Header } from "src/components/header/Header.tsx";
import { ReposNavHeader } from "src/components/header/NavHeader.tsx";
import { LoadIcon } from "src/components/icons/LoadIcon.tsx";
import { Repo } from "src/components/repos/Repo.tsx";
import { FlowsContext, WorkflowsContext } from "src/providers/provider.tsx";
import { getPushPrWorkflows } from "src/utils/flowUtil.ts";
import { getRepoOrgAndName, sortByRepoName } from "src/utils/gitUtil.ts";

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
  const workflows = useContext(WorkflowsContext);

  if (flows == null) {
    return <LoadIcon />;
  }

  return Array.from(flows.keys())
    .sort(sortByRepoName)
    .map((repoOrgName, index) => {
      const [repoOrg, repoName] = getRepoOrgAndName(repoOrgName);
      const [pushWorkflows, prWorkflows] = getPushPrWorkflows(
        flows,
        workflows,
        repoOrgName,
        repoOrg,
      );

      return (
        <Repo
          key={repoOrgName}
          isFirst={index === 0}
          repoOrg={repoOrg}
          repoName={repoName}
          pushWorkflows={pushWorkflows}
          prWorkflows={prWorkflows}
        />
      );
    });
}

export { Repos };
