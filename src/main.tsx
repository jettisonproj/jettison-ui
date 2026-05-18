import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import "src/main.css";
import { router } from "src/router.tsx";

createRoot(document.getElementById("root") as Element).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
