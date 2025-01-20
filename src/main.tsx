import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "src/index.css";
import App from "src/App.tsx";

createRoot(document.getElementById("root") as Element).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
