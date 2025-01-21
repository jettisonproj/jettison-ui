import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";

import "src/main.css";
import { Flow } from "src/components/flow/Flow.tsx";
import { Flows } from "src/components/flows/Flows.tsx";
import { Home } from "src/components/home/Home.tsx";
import { Namespaces } from "src/components/namespaces/Namespaces.tsx";

createRoot(document.getElementById("root") as Element).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route index element={<Home />} />
        <Route path="flows" element={<Namespaces />} />
        <Route path="flows/:namespace" element={<Flows />} />
        <Route path="flows/:namespace/:name" element={<Flow />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
