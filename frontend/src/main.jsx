import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AppErrorBoundary } from "./AppErrorBoundary.jsx";
import Presentation from "./presentation/Presentation.jsx";
import "./styles.css";

const Root = window.location.pathname.startsWith("/presentation") ? Presentation : App;

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Root />
    </AppErrorBoundary>
  </React.StrictMode>
);
