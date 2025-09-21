import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import "src/main.css";
import { routes } from "src/routes.ts";
import { Flow } from "src/components/flow/Flow.tsx";
import { Flows } from "src/components/flows/Flows.tsx";
import { Home } from "src/components/home/Home.tsx";
import { NodeDetails } from "src/components/nodedetails/NodeDetails.tsx";
import { Repos } from "src/components/repos/Repos.tsx";
import { Provider } from "src/providers/provider.tsx";

createRoot(document.getElementById("root") as Element).render(
  <StrictMode>
    <Provider>
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path={routes.flows} element={<Repos />} />
          <Route
            path={`${routes.flows}/:repoOrg/:repoName`}
            element={<Flows />}
          />
          <Route
            path={`${routes.flows}/:repoOrg/:repoName/:flowName`}
            element={<Flow />}
          />
          <Route
            path={`${routes.flows}/:repoOrg/:repoName/:flowName/:nodeName`}
            element={<NodeDetails />}
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  </StrictMode>,
);
