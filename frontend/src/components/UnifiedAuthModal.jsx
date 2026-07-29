import {
  BriefcaseBusiness,
  Building2,
  Eye,
  EyeOff,
  HandHeart,
  Landmark,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
  Users,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import logoFullTransparent from "../assets/brand/rozgaarai-logo-full-transparent.png";
import { translations } from "../i18n/translations";
import { normalizeRole, ROLES } from "../lib/roles";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06L5.84 9.9C6.71 7.3 9.14 5.38 12 5.38z" />
    </svg>
  );
}

const roleIcons = {
  [ROLES.WORKER]: UserRound,
  [ROLES.EMPLOYER]: BriefcaseBusiness,
  [ROLES.NGO]: Landmark
};

function roleCopyKey(role) {
  if (role === ROLES.EMPLOYER) return "employer";
  if (role === ROLES.NGO) return "ngo";
  return "worker";
}

function titleFor(copy, mode, role) {
  if (role) {
    const meta = copy.roles?.[roleCopyKey(role)];
    if (meta) return mode === "signup" ? meta.signupTitle : meta.signinTitle;
  }
  return mode === "signup" ? copy.defaultSignup : copy.defaultSignin;
}

function descriptionFor(copy, role) {
  return role ? copy.roles?.[roleCopyKey(role)]?.description || copy.defaultDescription : copy.defaultDescription;
}

function primaryCtaFor(copy, mode, role) {
  if (role) {
    const meta = copy.roles?.[roleCopyKey(role)];
    if (meta) return mode === "signup" ? meta.ctaSignup : meta.ctaSignin;
  }
  return mode === "signup" ? copy.tabs.signup : copy.tabs.signin;
}

function fieldLabelFor(copy, role) {
  if (role === ROLES.EMPLOYER || role === ROLES.NGO) return copy.fields.workEmail;
  return copy.fields.email;
}

function AuthField({ icon: Icon, label, children }) {
  return (
    <label className="auth-field relative block rounded-xl border border-white/60 bg-white/70 px-3 py-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl transition focus-within:border-blue-300 focus-within:bg-white/85 focus-within:ring-4 focus-within:ring-blue-200/70">
      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.08em] text-slate-500">
        {Icon && <Icon className="h-3.5 w-3.5 text-blue-600" aria-hidden="true" />}
        {label}
      </span>
      {children}
    </label>
  );
}

export function UnifiedAuthModal({
  open,
  mode,
  form,
  loading,
  error,
  fieldErrors = {},
  onClose,
  onModeChange,
  onFieldChange,
  onSubmit,
  onGoogle,
  onDemo,
  showPassword,
  onTogglePassword,
  lang = "en"
}) {
  const dialogRef = useRef(null);
  const [capsLock, setCapsLock] = useState(false);
  const copy = translations[lang]?.authModal || translations.en.authModal;
  const role = form.role ? normalizeRole(form.role) : "";
  const activeMeta = role ? copy.roles?.[roleCopyKey(role)] : null;
  const safeMode = mode === "signup" ? "signup" : "signin";
  const disabled = Boolean(loading);
  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => {
      const first = dialogRef.current?.querySelector("button, input, select, textarea, [href]");
      first?.focus();
    }, 0);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const roleDescription = useMemo(() => activeMeta?.selectorCopy || copy.roleDescription, [activeMeta, copy.roleDescription]);

  if (!open) return null;

  function handleKeyDown(event) {
    if (event.key === "Escape" && !disabled) {
      onClose();
      return;
    }
    if (event.key !== "Tab") return;
    const focusable = Array.from(dialogRef.current?.querySelectorAll("button, input, select, textarea, a[href]") || [])
      .filter((element) => !element.disabled && element.offsetParent !== null);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center overflow-hidden bg-[radial-gradient(circle_at_30%_10%,rgba(37,99,235,0.28),transparent_28%),radial-gradient(circle_at_82%_78%,rgba(34,197,94,0.20),transparent_30%),rgba(2,6,23,0.54)] px-3 py-3 backdrop-blur-[10px] sm:px-4"
      role="presentation"
      onMouseDown={(event) => {
        if (!disabled && event.target === event.currentTarget) onClose();
      }}
      onKeyDown={handleKeyDown}
    >
      <form
        ref={dialogRef}
        onSubmit={onSubmit}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-title"
        aria-describedby="auth-subtitle"
        className="auth-modal relative max-h-[calc(100dvh-24px)] w-[min(94vw,620px)] overflow-hidden rounded-[26px] border border-white/70 bg-white/94 p-3.5 shadow-[0_24px_76px_rgba(37,99,235,0.20),0_0_34px_rgba(34,197,94,0.07),inset_0_1px_0_rgba(255,255,255,0.74)] outline-none backdrop-blur-[14px] backdrop-saturate-[125%] sm:p-4"
      >
        <style>{`
          @keyframes authModalIn {
            from { opacity: 0; transform: translateY(10px) scale(.985); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .auth-modal {
            animation: authModalIn .35s ease-out;
            background:
              linear-gradient(145deg, rgba(255,255,255,.94), rgba(239,246,255,.82) 42%, rgba(240,253,244,.78)),
              radial-gradient(circle at 20% 0%, rgba(37,99,235,.07), transparent 34%),
              radial-gradient(circle at 100% 100%, rgba(34,197,94,.06), transparent 30%);
            -webkit-backdrop-filter: blur(14px) saturate(125%);
            backdrop-filter: blur(14px) saturate(125%);
          }
          @media (max-height: 760px) {
            .auth-modal { padding: 12px 14px !important; }
            .auth-logo { height: 48px !important; }
            .auth-title { font-size: 24px !important; margin-top: 6px !important; }
            .auth-subtitle { margin-top: 4px !important; font-size: 11px !important; line-height: 1.3 !important; }
            .auth-tabs { margin-top: 8px !important; }
            .auth-google { margin-top: 8px !important; min-height: 38px !important; }
            .auth-divider { margin-top: 8px !important; margin-bottom: 8px !important; }
            .auth-field { padding-top: 5px !important; padding-bottom: 5px !important; }
            .auth-field input { height: 22px !important; margin-top: 2px !important; }
            .auth-role { margin-top: 8px !important; padding: 8px !important; }
            .auth-role-card { min-height: 46px !important; padding-top: 6px !important; padding-bottom: 6px !important; }
            .auth-role-copy { margin-top: 6px !important; padding: 6px 10px !important; line-height: 1.35 !important; }
            .auth-submit { margin-top: 8px !important; min-height: 38px !important; }
            .auth-switch { margin-top: 4px !important; padding-top: 5px !important; padding-bottom: 5px !important; }
            .auth-demo { margin-top: 6px !important; padding: 8px !important; }
            .auth-demo-button { min-height: 32px !important; }
            .auth-footer { margin-top: 5px !important; font-size: 9px !important; line-height: 1.2 !important; }
          }
          @media (prefers-reduced-motion: reduce) {
            .auth-modal { animation: none !important; }
          }
        `}</style>
        <button
          type="button"
          className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-slate-950"
          onClick={onClose}
          disabled={disabled}
          aria-label={copy.close}
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-11 text-center">
          <img src={logoFullTransparent} alt="RozgaarAI" className="auth-logo mx-auto h-14 w-auto max-w-[min(21rem,76vw)] object-contain" />
          <div className="mx-auto mt-1.5 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/55 px-3 py-1 text-[11px] font-black text-slate-600 shadow-sm backdrop-blur-xl">
            <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
            {copy.secure}
          </div>
        </div>

        <div className="auth-tabs mt-2.5 grid grid-cols-2 rounded-xl border border-white/60 bg-white/45 p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-xl">
          {[
            ["signin", copy.tabs.signin],
            ["signup", copy.tabs.signup]
          ].map(([nextMode, label]) => (
            <button
              key={nextMode}
              type="button"
              onClick={() => onModeChange(nextMode)}
              disabled={disabled}
              className={`min-h-9 rounded-lg text-sm font-black transition ${safeMode === nextMode ? "bg-white/85 text-blue-700 shadow-sm" : "text-slate-500 hover:bg-white/40 hover:text-slate-900"}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-2 text-center">
          <h2 id="auth-title" className="auth-title text-2xl font-black leading-tight tracking-tight text-slate-950 sm:text-[28px]">
            {titleFor(copy, safeMode, role)}
          </h2>
          <p id="auth-subtitle" className="auth-subtitle mx-auto mt-1.5 max-w-xl text-xs font-semibold leading-5 text-slate-600">
            {descriptionFor(copy, role)}
          </p>
        </div>

        <button
          type="button"
          className="auth-google mt-3 flex min-h-10 w-full items-center justify-center gap-3 rounded-xl border border-white/70 bg-white/75 px-4 text-sm font-black text-slate-900 shadow-sm backdrop-blur-xl transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
          onClick={onGoogle}
          disabled={disabled}
        >
          {loading === copy.googleConnecting ? <Loader2 className="h-5 w-5 animate-spin text-blue-600" /> : <GoogleIcon />}
          {loading === copy.googleConnecting ? copy.googleConnecting : copy.googleContinue}
        </button>

        <div className="auth-divider my-2.5 flex items-center gap-3">
          <span className="h-px flex-1 bg-slate-200" />
          <span className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-400">{safeMode === "signup" ? copy.dividerSignup : copy.dividerSignin}</span>
          <span className="h-px flex-1 bg-slate-200" />
        </div>

        <div className={`grid gap-2 ${safeMode === "signup" ? "sm:grid-cols-2" : ""}`}>
          {safeMode === "signup" && (
            <AuthField icon={UserRound} label={copy.fields.fullName}>
              <input className="mt-0.5 h-6 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400" autoComplete="name" value={form.name || ""} onChange={(event) => onFieldChange("name", event.target.value)} placeholder={copy.placeholders.fullName} aria-invalid={Boolean(fieldErrors.name)} />
            </AuthField>
          )}

          <AuthField icon={Mail} label={fieldLabelFor(copy, role)}>
            <input className="mt-0.5 h-6 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400" type="email" autoComplete="email" value={form.email || ""} onChange={(event) => onFieldChange("email", event.target.value)} placeholder="you@example.com" aria-invalid={Boolean(fieldErrors.email)} />
          </AuthField>

          <AuthField icon={LockKeyhole} label={copy.fields.password}>
            <input
              className="mt-0.5 h-6 w-full bg-transparent pr-10 text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400"
              type={showPassword ? "text" : "password"}
              autoComplete={safeMode === "signup" ? "new-password" : "current-password"}
              value={form.password || ""}
              onChange={(event) => onFieldChange("password", event.target.value)}
              onKeyUp={(event) => setCapsLock(Boolean(event.getModifierState?.("CapsLock")))}
              placeholder={copy.placeholders.password}
              aria-invalid={Boolean(fieldErrors.password)}
            />
            <button type="button" onClick={onTogglePassword} className="absolute bottom-2 right-3 grid h-8 w-8 place-items-center rounded-full text-slate-500 hover:bg-blue-50 hover:text-blue-700" aria-label={showPassword ? copy.password.hide : copy.password.show}>
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </AuthField>

          {capsLock && <p className="rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700">{copy.password.caps}</p>}

          {safeMode === "signup" && (
            <AuthField icon={LockKeyhole} label={copy.fields.confirmPassword}>
              <input className="mt-0.5 h-6 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400" type={showPassword ? "text" : "password"} autoComplete="new-password" value={form.confirmPassword || ""} onChange={(event) => onFieldChange("confirmPassword", event.target.value)} placeholder={copy.placeholders.confirmPassword} aria-invalid={Boolean(fieldErrors.confirmPassword)} />
            </AuthField>
          )}

          {safeMode === "signin" && (
            <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={Boolean(form.remember)} onChange={(event) => onFieldChange("remember", event.target.checked)} />
              {copy.remember}
            </label>
          )}
        </div>

        {safeMode === "signup" && role === ROLES.WORKER && (
          <div className="mt-2">
            <AuthField icon={Phone} label={copy.fields.phoneOptional}>
              <input className="mt-1 h-7 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400" value={form.phone || ""} onChange={(event) => onFieldChange("phone", event.target.value)} placeholder="+91 90000 00000" />
            </AuthField>
          </div>
        )}

        <section className="auth-role mt-2.5 rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50/80 via-white/70 to-emerald-50/75 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_12px_28px_rgba(37,99,235,0.08)] backdrop-blur-xl">
          <p className="bg-gradient-to-r from-blue-700 to-emerald-600 bg-clip-text px-1 text-xs font-black uppercase tracking-[0.08em] text-transparent">{copy.chooseRole}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {Object.values(ROLES).filter((item) => [ROLES.WORKER, ROLES.EMPLOYER, ROLES.NGO].includes(item)).map((item) => {
              const meta = copy.roles[roleCopyKey(item)];
              const Icon = roleIcons[item];
              const active = role === item;
              const tone = item === ROLES.WORKER
                ? "border-blue-200 bg-blue-50/90 text-blue-800 hover:border-blue-300 hover:bg-blue-100 focus:ring-blue-100"
                : item === ROLES.EMPLOYER
                  ? "border-emerald-200 bg-emerald-50/90 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-100"
                  : "border-cyan-200 bg-cyan-50/90 text-cyan-800 hover:border-cyan-300 hover:bg-cyan-100 focus:ring-cyan-100";
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => onFieldChange("role", item)}
                  disabled={disabled}
                  className={`auth-role-card min-h-[52px] rounded-xl border px-2.5 py-1.5 text-center text-xs font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70 ${active ? "border-blue-500 bg-gradient-to-r from-blue-600 to-emerald-500 text-white shadow-[0_12px_24px_rgba(37,99,235,0.22)] ring-2 ring-emerald-200" : tone}`}
                  aria-pressed={active}
                >
                  <Icon className="mx-auto mb-1 h-4 w-4" />
                  <span className="block leading-tight">{meta.label}</span>
                </button>
              );
            })}
          </div>
          <p className="auth-role-copy mt-2 rounded-xl border border-white/70 bg-white/60 px-3 py-1.5 text-xs font-bold leading-4 text-slate-600 backdrop-blur-xl">{roleDescription}</p>
        </section>

        {safeMode === "signup" && role === ROLES.EMPLOYER && (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <AuthField icon={Building2} label={copy.fields.organizationCompany}>
              <input className="mt-1 h-7 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400" value={form.organizationName || ""} onChange={(event) => onFieldChange("organizationName", event.target.value)} placeholder={copy.placeholders.company} aria-invalid={Boolean(fieldErrors.organizationName)} />
            </AuthField>
            <AuthField icon={BriefcaseBusiness} label={copy.fields.employerType}>
              <input className="mt-1 h-7 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400" value={form.employerType || ""} onChange={(event) => onFieldChange("employerType", event.target.value)} placeholder={copy.placeholders.employerType} />
            </AuthField>
          </div>
        )}

        {safeMode === "signup" && role === ROLES.NGO && (
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <AuthField icon={Landmark} label={copy.fields.ngoName}>
              <input className="mt-1 h-7 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400" value={form.organizationName || ""} onChange={(event) => onFieldChange("organizationName", event.target.value)} placeholder={copy.placeholders.organization} aria-invalid={Boolean(fieldErrors.organizationName)} />
            </AuthField>
            <AuthField icon={HandHeart} label={copy.fields.organizationType}>
              <input className="mt-1 h-7 w-full bg-transparent text-sm font-bold text-slate-950 outline-none placeholder:text-slate-400" value={form.organizationType || ""} onChange={(event) => onFieldChange("organizationType", event.target.value)} placeholder={copy.placeholders.organizationType} />
            </AuthField>
          </div>
        )}

        {error && <div id="auth-error" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">{error}</div>}
        {Object.values(fieldErrors).filter(Boolean).length > 0 && (
          <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-4 py-2 text-xs font-bold text-amber-700">
            {Object.values(fieldErrors).filter(Boolean)[0]}
          </div>
        )}

        <button type="submit" disabled={disabled} className="auth-submit mt-2.5 flex min-h-10 w-full items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-600 to-green-600 px-5 text-sm font-black text-white shadow-[0_18px_44px_rgba(37,99,235,0.3)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70">
          {loading && loading !== copy.googleConnecting ? <Loader2 className="h-5 w-5 animate-spin" /> : <LockKeyhole className="h-5 w-5" />}
          {loading && loading !== copy.googleConnecting ? loading : primaryCtaFor(copy, safeMode, role)}
        </button>

        <button type="button" onClick={() => onModeChange(safeMode === "signup" ? "signin" : "signup")} disabled={disabled} className="auth-switch mt-1.5 w-full rounded-xl px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-white/55">
          {safeMode === "signup" ? copy.switchSignup : copy.switchSignin}
          <span className="font-black text-blue-700">{safeMode === "signup" ? copy.tabs.signin : copy.tabs.signup}</span>
        </button>

        <section className="auth-demo mt-1.5 rounded-2xl border border-blue-100/80 bg-gradient-to-br from-blue-50/80 via-white/70 to-emerald-50/75 p-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.72),0_12px_28px_rgba(37,99,235,0.08)] backdrop-blur-xl">
          <p className="bg-gradient-to-r from-blue-700 to-emerald-600 bg-clip-text text-center text-xs font-black uppercase tracking-[0.08em] text-transparent">{copy.demoTitle}</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            {[
              [ROLES.WORKER, Users, copy.demo.worker, "border-blue-200 bg-blue-50/90 text-blue-800 hover:border-blue-300 hover:bg-blue-100 focus:ring-blue-100"],
              [ROLES.EMPLOYER, BriefcaseBusiness, copy.demo.employer, "border-emerald-200 bg-emerald-50/90 text-emerald-800 hover:border-emerald-300 hover:bg-emerald-100 focus:ring-emerald-100"],
              [ROLES.NGO, HandHeart, copy.demo.ngo, "border-cyan-200 bg-cyan-50/90 text-cyan-800 hover:border-cyan-300 hover:bg-cyan-100 focus:ring-cyan-100"]
            ].map(([demoRole, Icon, label, tone]) => (
              <button key={demoRole} type="button" onClick={() => onDemo(demoRole)} disabled={disabled} className={`auth-demo-button min-h-9 rounded-xl border px-2 text-xs font-black shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-4 disabled:cursor-not-allowed disabled:opacity-70 ${tone}`}>
                <Icon className="mx-auto mb-0.5 h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </section>

        <p className="auth-footer mt-1.5 flex items-start justify-center gap-2 text-center text-[10px] font-bold leading-3 text-slate-500">
          <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {copy.footer}
        </p>
      </form>
    </div>
  );
}
