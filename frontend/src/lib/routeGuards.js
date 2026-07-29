import { getDefaultRouteForRole, normalizeRole, ROLES } from "./roles.js";

export function getProtectedRouteInfo(pathname) {
  const path = pathname || "/";
  if (path === "/admin/diagnostics") {
    return { protected: true, role: ROLES.ADMIN, requiresNgoOnboarding: false };
  }
  if (path === "/ngo/onboarding") {
    return { protected: false, role: ROLES.NGO, requiresNgoOnboarding: false };
  }
  if (path === "/employer/onboarding") {
    return { protected: false, role: ROLES.EMPLOYER, requiresNgoOnboarding: false };
  }
  if (path === "/ngo" || path.startsWith("/ngo/")) {
    return { protected: true, role: ROLES.NGO, requiresNgoOnboarding: true };
  }
  if (path === "/employer" || path.startsWith("/employer/")) {
    return { protected: true, role: ROLES.EMPLOYER, requiresNgoOnboarding: false };
  }
  if (path === "/dashboard" || path.startsWith("/dashboard/") || path === "/create-profile") {
    return { protected: true, role: ROLES.WORKER, requiresNgoOnboarding: false };
  }
  return { protected: false, role: null, requiresNgoOnboarding: false };
}

export function resolveRouteAccess({ account, pathname, ngoOnboardingComplete = false }) {
  const route = getProtectedRouteInfo(pathname);
  if (!route.protected) {
    return { allowed: true, redirectTo: "", reason: "public" };
  }

  if (!account) {
    return { allowed: false, redirectTo: "/login", reason: "auth_required", role: route.role };
  }

  const accountRole = normalizeRole(account.role);
  if (accountRole !== route.role) {
    return {
      allowed: false,
      redirectTo: getDefaultRouteForRole(accountRole),
      reason: "role_mismatch"
    };
  }

  if (route.requiresNgoOnboarding && accountRole === ROLES.NGO && !ngoOnboardingComplete) {
    return { allowed: false, redirectTo: "/ngo/onboarding", reason: "ngo_onboarding_required" };
  }

  return { allowed: true, redirectTo: "", reason: "allowed" };
}
