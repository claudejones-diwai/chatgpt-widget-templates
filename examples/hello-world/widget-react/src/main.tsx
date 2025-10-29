// Entry point for React app

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

const rootElement = document.getElementById("hello-world-root");

if (!rootElement) {
  throw new Error("Root element not found. Expected element with id 'hello-world-root'");
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);
