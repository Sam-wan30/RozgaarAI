const STORAGE_KEYS = {
  account: "rozgaarai-production-account-v1",
  workerProfiles: "rozgaarai-worker-profiles-v1",
  employerSavedWorkers: "rozgaarai-employer-saved-workers-v1",
  impact: "rozgaarai-impact-data-v1"
};

const hasDatabaseConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY);
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.replace(/\/$/, "");
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function readJson(key, fallback) {
  try {
    return JSON.parse(window.localStorage.getItem(key) || "null") ?? fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  window.localStorage.setItem(key, JSON.stringify(value));
  return value;
}

async function supabaseRequest(path, options = {}) {
  if (!hasDatabaseConfig) {
    throw new Error("Database credentials are not configured.");
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=representation,resolution=merge-duplicates",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`Database request failed with ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

async function tryDatabase(operation, fallback) {
  if (!hasDatabaseConfig) {
    return fallback();
  }

  try {
    return await operation();
  } catch (error) {
    console.warn("RozgaarAI database fallback active:", error.message);
    return fallback();
  }
}

export const database = {
  mode: hasDatabaseConfig ? "supabase" : "local-fallback",

  async signInOrCreateAccount(account) {
    const record = {
      id: account.uid || account.id || account.email || `local-${Date.now()}`,
      uid: account.uid || account.id,
      name: account.name,
      email: account.email,
      photoUrl: account.photoUrl,
      role: account.role,
      provider: account.provider || (hasDatabaseConfig ? "supabase" : "local-fallback"),
      createdAt: account.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("rozgaar_accounts?on_conflict=email", {
          method: "POST",
          body: JSON.stringify({
            id: record.id,
            name: record.name,
            email: record.email,
            role: record.role,
            photo_url: record.photoUrl,
            provider: record.provider,
            created_at: record.createdAt,
            last_login: record.lastLogin
          })
        });
        writeJson(STORAGE_KEYS.account, record);
        return rows?.[0] ? { ...record, id: rows[0].id || record.id } : record;
      },
      () => writeJson(STORAGE_KEYS.account, record)
    );
  },

  async getCurrentAccount() {
    return readJson(STORAGE_KEYS.account, null);
  },

  async signOut() {
    window.localStorage.removeItem(STORAGE_KEYS.account);
    return true;
  },

  async saveWorkerProfile(profile) {
    const saveLocal = () => {
      const profiles = readJson(STORAGE_KEYS.workerProfiles, []);
      const nextProfiles = [profile, ...profiles.filter((item) => item.workerId !== profile.workerId)];
      writeJson(STORAGE_KEYS.workerProfiles, nextProfiles);
      return profile;
    };

    return tryDatabase(
      async () => {
        await supabaseRequest("rozgaar_worker_profiles?on_conflict=worker_id", {
          method: "POST",
          body: JSON.stringify({
            worker_id: profile.workerId,
            payload: profile,
            updated_at: new Date().toISOString()
          })
        });
        return saveLocal();
      },
      saveLocal
    );
  },

  async saveEmployerWorker(workerId) {
    const saveLocal = () => {
      const savedWorkers = readJson(STORAGE_KEYS.employerSavedWorkers, []);
      const nextSavedWorkers = savedWorkers.includes(workerId) ? savedWorkers : [workerId, ...savedWorkers];
      writeJson(STORAGE_KEYS.employerSavedWorkers, nextSavedWorkers);
      return nextSavedWorkers;
    };

    return tryDatabase(
      async () => {
        await supabaseRequest("rozgaar_employer_saved_workers", {
          method: "POST",
          body: JSON.stringify({
            worker_id: workerId,
            saved_at: new Date().toISOString()
          })
        });
        return saveLocal();
      },
      saveLocal
    );
  },

  async getImpactData() {
    const fallbackImpact = () => readJson(STORAGE_KEYS.impact, {
      workersRegistered: 0,
      employersActive: 0,
      ngoPrograms: 0,
      savedWorkers: readJson(STORAGE_KEYS.employerSavedWorkers, []).length
    });

    return tryDatabase(
      async () => {
        const rows = await supabaseRequest("rozgaar_impact_metrics?select=*&limit=1", {
          method: "GET"
        });
        return rows?.[0]?.payload || fallbackImpact();
      },
      fallbackImpact
    );
  }
};
