import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import "src/main.css";
import { routes } from "src/routes.ts";
import { Flow } from "src/components/flow/Flow.tsx";
import { Flows } from "src/components/flows/Flows.tsx";
import { Home } from "src/components/home/Home.tsx";
import { Namespaces } from "src/components/namespaces/Namespaces.tsx";

createRoot(document.getElementById("root") as Element).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path={routes.flows} element={<Namespaces />} />
        <Route path={`${routes.flows}/:namespace`} element={<Flows />} />
        <Route path={`${routes.flows}/:namespace/:name`} element={<Flow />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
