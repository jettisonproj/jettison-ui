import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
} from "@tanstack/react-router";

import { Flow } from "src/components/flow/Flow.tsx";
import { FlowNodeDetails } from "src/components/flownodedetails/FlowNodeDetails.tsx";
import { Home } from "src/components/home/Home.tsx";
import { Repos } from "src/components/repos/Repos.tsx";
import { Provider } from "src/providers/provider.tsx";
import { routes } from "src/routes.ts";

const searchWithNode = (search: Record<string, unknown>) => ({
  node: typeof search.node === "string" ? search.node : undefined,
});

const searchWithTab = (search: Record<string, unknown>) => ({
  tab: typeof search.tab === "string" ? search.tab : undefined,
});

const searchWithNodeAndTab = (search: Record<string, unknown>) => ({
  node: typeof search.node === "string" ? search.node : undefined,
  tab: typeof search.tab === "string" ? search.tab : undefined,
});

const rootRoute = createRootRoute({
  component: () => (
    <Provider>
      <Outlet />
    </Provider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.home,
  component: Home,
});

const reposRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: routes.flows,
  component: Repos,
});

const flowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes.flows}/$repoOrg/$repoName/$triggerRoute`,
  validateSearch: searchWithNode,
  component: function FlowRouteComponent() {
    const { repoOrg, repoName, triggerRoute } = flowRoute.useParams();
    const { node } = flowRoute.useSearch();
    return (
      <Flow
        repoOrg={repoOrg}
        repoName={repoName}
        triggerRoute={triggerRoute}
        node={node}
      />
    );
  },
});

const flowWorkflowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes.flows}/$repoOrg/$repoName/$triggerRoute/workflows/$selectedWorkflow`,
  validateSearch: searchWithNodeAndTab,
  component: function FlowWorkflowRouteComponent() {
    const { repoOrg, repoName, triggerRoute, selectedWorkflow } =
      flowWorkflowRoute.useParams();
    const { node } = flowWorkflowRoute.useSearch();
    return (
      <Flow
        repoOrg={repoOrg}
        repoName={repoName}
        triggerRoute={triggerRoute}
        selectedWorkflow={selectedWorkflow}
        node={node}
      />
    );
  },
});

const nodeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes.flows}/$repoOrg/$repoName/$triggerRoute/$nodeName`,
  validateSearch: searchWithTab,
  component: function NodeRouteComponent() {
    const { repoOrg, repoName, triggerRoute, nodeName } = nodeRoute.useParams();
    return (
      <FlowNodeDetails
        repoOrg={repoOrg}
        repoName={repoName}
        triggerRoute={triggerRoute}
        nodeName={nodeName}
      />
    );
  },
});

const nodeWorkflowRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: `${routes.flows}/$repoOrg/$repoName/$triggerRoute/$nodeName/workflows/$selectedWorkflow`,
  validateSearch: searchWithTab,
  component: function NodeWorkflowRouteComponent() {
    const { repoOrg, repoName, triggerRoute, nodeName, selectedWorkflow } =
      nodeWorkflowRoute.useParams();
    return (
      <FlowNodeDetails
        repoOrg={repoOrg}
        repoName={repoName}
        triggerRoute={triggerRoute}
        nodeName={nodeName}
        selectedWorkflow={selectedWorkflow}
      />
    );
  },
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  reposRoute,
  flowRoute,
  flowWorkflowRoute,
  nodeRoute,
  nodeWorkflowRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export { router };
