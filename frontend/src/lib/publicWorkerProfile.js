import { demoProfiles, incomePassports } from "../data/mockData";
import { createWorkerId, localMatches } from "./api";

export const defaultShareSettings = {
  publicProfile: true,
  photo: true,
  phone: false,
  email: false,
  location: true,
  workHistory: true,
  certificates: true,
  income: false,
  contactRequest: true
};

function safeWorkerId(workerId) {
  return String(workerId || "").trim().replace(/[^A-Za-z0-9_-]/g, "");
}

export function getWorkerPublicProfileUrl(workerId) {
  const id = safeWorkerId(workerId);
  const configuredBase = import.meta.env.VITE_PUBLIC_APP_URL;
  const runtimeBase = typeof window !== "undefined" ? window.location.origin : "";
  const baseUrl = String(configuredBase || runtimeBase || "").replace(/\/$/, "");
  return `${baseUrl}/public/worker/${encodeURIComponent(id)}`;
}

export function getWorkerIdFromPublicPath(pathname) {
  const parts = String(pathname || "").split("/").filter(Boolean);
  if (parts[0] === "public" && parts[1] === "worker") return safeWorkerId(decodeURIComponent(parts[2] || ""));
  if (parts[0] === "public" || parts[0] === "profile" || parts[0] === "worker") return safeWorkerId(decodeURIComponent(parts.at(-1) || ""));
  return "";
}

function readJson(value, fallback) {
  try {
    return JSON.parse(value || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function allLocalWorkerProfiles() {
  if (typeof window === "undefined") return [];
  const profiles = [];
  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key || !key.startsWith("rozgaarai-worker-profiles-v1")) continue;
    const rows = readJson(window.localStorage.getItem(key), []);
    if (Array.isArray(rows)) profiles.push(...rows);
  }
  return profiles;
}

function normalizeProfileRecord(record, source = "local") {
  if (!record) return null;
  const worker = record.worker || record;
  const workerId = safeWorkerId(record.workerId || worker.workerId || createWorkerId(worker));
  if (!workerId) return null;
  const shareSettings = { ...defaultShareSettings, ...(record.shareSettings || worker.shareSettings || {}) };
  const records = record.wageEntries || record.workRecords || (source === "demo" ? incomePassports[worker.name] || [] : []);
  const matches = record.matches || (source === "demo" ? localMatches(worker) : []);
  const status = record.publicStatus || worker.publicStatus || (shareSettings.publicProfile === false ? "private" : "active");

  return {
    source,
    userId: record.userId || worker.userId || "",
    status,
    shareSettings,
    worker: { ...worker, workerId },
    workerId,
    profile: record.profile || {},
    resume: record.resume || null,
    wage: record.wage || null,
    wageEntries: records,
    matches,
    certificates: record.certificates || worker.certificates || [],
    verifier: record.verifier || worker.verifier || (source === "demo" ? "RozgaarAI Demo Verification" : ""),
    updatedAt: record.updatedAt || worker.updatedAt || worker.createdAt || ""
  };
}

export function getPublicWorkerByIdSync(workerId) {
  const id = safeWorkerId(workerId);
  if (!id) return { status: "not-found", profile: null };

  const demo = demoProfiles.find((profile) => safeWorkerId(profile.workerId) === id);
  if (demo) return { status: "active", profile: normalizeProfileRecord(demo, "demo") };

  const local = allLocalWorkerProfiles().find((profile) => safeWorkerId(profile.workerId || profile.worker?.workerId) === id);
  if (!local) return { status: "not-found", profile: null };

  const profile = normalizeProfileRecord(local, "local");
  return { status: profile?.status || "not-found", profile };
}

export async function getPublicWorkerById(workerId) {
  const id = safeWorkerId(workerId);
  const localResult = getPublicWorkerByIdSync(id);
  if (!id || localResult.profile?.source === "demo") return localResult;

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return localResult;

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/rozgaar_worker_profiles?worker_id=eq.${encodeURIComponent(id)}&select=*&limit=1`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Accept: "application/json"
      }
    });
    if (!response.ok) return localResult;
    const rows = await response.json();
    const row = rows?.[0];
    if (!row) return localResult;
    const profile = normalizeProfileRecord({ ...(row.payload || {}), workerId: row.worker_id || row.payload?.workerId }, "database");
    return { status: profile?.status || "not-found", profile };
  } catch {
    return localResult;
  }
}
