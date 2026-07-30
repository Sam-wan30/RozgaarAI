import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AppErrorBoundary } from "./AppErrorBoundary.jsx";
import PresentationPage from "./presentation/PresentationPage.jsx";
import "./styles.css";

const routeChangeEvent = "rozgaarai:routechange";

function isPresentationRoute(pathname) {
  return pathname === "/presentation" || pathname.startsWith("/presentation/");
}

function installRouteChangeEvents() {
  if (window.__rozgaarRouteEventsInstalled) return;
  window.__rozgaarRouteEventsInstalled = true;

  const notify = () => window.dispatchEvent(new Event(routeChangeEvent));
  const { pushState, replaceState } = window.history;

  window.history.pushState = function pushStateWithRouteEvent(...args) {
    const result = pushState.apply(this, args);
    notify();
    return result;
  };

  window.history.replaceState = function replaceStateWithRouteEvent(...args) {
    const result = replaceState.apply(this, args);
    notify();
    return result;
  };
}

function Root() {
  const [pathname, setPathname] = useState(() => window.location.pathname);
  const Page = isPresentationRoute(pathname) ? PresentationPage : App;

  useEffect(() => {
    installRouteChangeEvents();
    const syncPathname = () => setPathname(window.location.pathname);

    window.addEventListener("popstate", syncPathname);
    window.addEventListener(routeChangeEvent, syncPathname);
    return () => {
      window.removeEventListener("popstate", syncPathname);
      window.removeEventListener(routeChangeEvent, syncPathname);
    };
  }, []);

  return <Page />;
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <Root />
    </AppErrorBoundary>
  </React.StrictMode>
);
