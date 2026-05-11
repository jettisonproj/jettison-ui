import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router";

import { Flow } from "src/components/flow/Flow.tsx";
import { FlowNodeDetails } from "src/components/flownodedetails/FlowNodeDetails.tsx";
import { Home } from "src/components/home/Home.tsx";
import { Repos } from "src/components/repos/Repos.tsx";
import "src/main.css";
import { Provider } from "src/providers/provider.tsx";
import { routes } from "src/routes.ts";

createRoot(document.getElementById("root") as Element).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path={routes.flows} element={<Repos />} />
          <Route
            path={`${routes.flows}/:repoOrg/:repoName/:triggerRoute`}
            element={<Flow />}
          />
          <Route
            path={`${routes.flows}/:repoOrg/:repoName/:triggerRoute/workflows/:selectedWorkflow`}
            element={<Flow />}
          />
          <Route
            path={`${routes.flows}/:repoOrg/:repoName/:triggerRoute/:nodeName`}
            element={<FlowNodeDetails />}
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
