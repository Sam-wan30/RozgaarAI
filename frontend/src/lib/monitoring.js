const LOG_STORAGE_KEY = "rozgaarai-client-events-v1";
const MAX_LOG_EVENTS = 80;

function nowIso() {
  return new Date().toISOString();
}

function redact(value) {
  if (value == null) return value;
  const text = String(value);
  return text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/(\+?\d[\d\s-]{7,}\d)/g, "[redacted-phone]")
    .replace(/(api[_-]?key|token|secret|password)=([^&\s]+)/gi, "$1=[redacted]");
}

function safePayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [
      key,
      typeof value === "object" && value !== null ? redact(JSON.stringify(value)) : redact(value)
    ])
  );
}

export function getClientLogBuffer() {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(LOG_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function logClientEvent(eventName, payload = {}, level = "info") {
  const event = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    eventName: redact(eventName),
    level,
    payload: safePayload(payload),
    createdAt: nowIso(),
    path: typeof window !== "undefined" ? window.location.pathname : ""
  };

  if (typeof window !== "undefined") {
    const nextEvents = [event, ...getClientLogBuffer()].slice(0, MAX_LOG_EVENTS);
    window.localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(nextEvents));
  }

  if (import.meta.env.DEV) {
    const logger = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
    logger(`[RozgaarAI:${level}] ${event.eventName}`, event.payload);
  }

  return event;
}

export function captureError(error, context = {}) {
  const errorPayload = {
    message: error?.message || "Unknown error",
    name: error?.name || "Error",
    stack: import.meta.env.DEV ? error?.stack : undefined,
    ...context
  };
  return logClientEvent("client_error", errorPayload, "error");
}
