// Entry point for React app

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

const rootElement = document.getElementById("{{PROJECT_NAME}}-root");

if (!rootElement) {
  throw new Error("Root element not found. Expected element with id '{{PROJECT_NAME}}-root'");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
