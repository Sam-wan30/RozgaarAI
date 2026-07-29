import { getClientLogBuffer } from "./monitoring";

function configured(value) {
  return Boolean(String(value || "").trim());
}

function safeOrigin(value) {
  try {
    return value ? new URL(value).origin : "";
  } catch {
    return "invalid-url";
  }
}

export function getRuntimeDiagnostics() {
  const appOrigin = typeof window !== "undefined" ? window.location.origin : "";
  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_API_URL || "";
  return {
    app: {
      name: "RozgaarAI",
      version: import.meta.env.VITE_APP_VERSION || "0.1.0",
      buildTimestamp: import.meta.env.VITE_BUILD_TIMESTAMP || "local-dev",
      mode: import.meta.env.MODE,
      origin: appOrigin
    },
    integrations: {
      api: { configured: configured(apiUrl), origin: safeOrigin(apiUrl) },
      supabase: { configured: configured(import.meta.env.VITE_SUPABASE_URL), origin: safeOrigin(import.meta.env.VITE_SUPABASE_URL) },
      firebase: { configured: configured(import.meta.env.VITE_FIREBASE_API_KEY) && configured(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) },
      publicAppUrl: { configured: configured(import.meta.env.VITE_PUBLIC_APP_URL), origin: safeOrigin(import.meta.env.VITE_PUBLIC_APP_URL) }
    },
    browser: typeof window === "undefined" ? {} : {
      userAgent: window.navigator.userAgent,
      language: window.navigator.language,
      online: window.navigator.onLine,
      storageAvailable: (() => {
        try {
          window.localStorage.setItem("__rozgaarai_probe", "1");
          window.localStorage.removeItem("__rozgaarai_probe");
          return true;
        } catch {
          return false;
        }
      })()
    },
    recentEvents: getClientLogBuffer().slice(0, 10)
  };
}

export async function runFrontendHealthCheck() {
  const diagnostics = getRuntimeDiagnostics();
  const checks = [
    {
      id: "runtime",
      label: "Frontend runtime",
      status: "pass",
      detail: `${diagnostics.app.name} ${diagnostics.app.version} running in ${diagnostics.app.mode}`
    },
    {
      id: "storage",
      label: "Local storage",
      status: diagnostics.browser.storageAvailable ? "pass" : "fail",
      detail: diagnostics.browser.storageAvailable ? "Available for demo/user fallback state" : "Browser storage is blocked"
    },
    {
      id: "api-config",
      label: "Backend API configuration",
      status: diagnostics.integrations.api.configured ? "pass" : "warn",
      detail: diagnostics.integrations.api.configured ? `Configured at ${diagnostics.integrations.api.origin}` : "Not configured; AI/local fallbacks still work"
    },
    {
      id: "auth-config",
      label: "Firebase authentication",
      status: diagnostics.integrations.firebase.configured ? "pass" : "warn",
      detail: diagnostics.integrations.firebase.configured ? "Firebase client config present" : "Missing Firebase client config"
    },
    {
      id: "supabase-config",
      label: "Production persistence",
      status: diagnostics.integrations.supabase.configured ? "pass" : "warn",
      detail: diagnostics.integrations.supabase.configured ? `Supabase configured at ${diagnostics.integrations.supabase.origin}` : "Not configured; local/demo persistence only"
    }
  ];

  const apiUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_API_URL || "";
  if (apiUrl) {
    try {
      const response = await fetch(`${apiUrl.replace(/\/$/, "")}/health`, { headers: { Accept: "application/json" } });
      checks.push({
        id: "api-health",
        label: "Backend health endpoint",
        status: response.ok ? "pass" : "fail",
        detail: response.ok ? "Backend returned healthy status" : `Backend returned HTTP ${response.status}`
      });
    } catch (error) {
      checks.push({
        id: "api-health",
        label: "Backend health endpoint",
        status: "fail",
        detail: error?.message || "Backend health request failed"
      });
    }
  }

  return { diagnostics, checks, checkedAt: new Date().toISOString() };
}
