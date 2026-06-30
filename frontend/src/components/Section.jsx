export function Section({ id, eyebrow, title, children, tone = "white" }) {
  const path = typeof window === "undefined" ? "/" : window.location.pathname;
  const hiddenOnLanding = new Set([
    "onboarding",
    "dashboard",
    "income-passport",
    "certificate",
    "profile",
    "jobs",
    "wages",
    "safety",
    "coach",
    "asha-story",
    "how",
    "guided-demo",
    "stakeholders",
    "impact",
    "testimonials"
  ]);
  if (path === "/" && hiddenOnLanding.has(id)) return null;
  if (path === "/create-profile" && id !== "onboarding") return null;
  if (path === "/employer" && id !== "employers") return null;
  if (path === "/dashboard" && id !== "product-dashboard") return null;

  const bg = tone === "warm" ? "bg-paper" : tone === "dark" ? "bg-ink text-white" : "bg-white";

  return (
    <section id={id} className={`${bg} py-14 sm:py-20`}>
      <div className="section-shell">
        {(eyebrow || title) && (
          <div className="mb-8 max-w-3xl">
            {eyebrow && (
              <p className="mb-2 text-sm font-black uppercase tracking-[0.18em] text-saffron">
                {eyebrow}
              </p>
            )}
            {title && <h2 className="text-3xl font-black leading-tight text-inherit sm:text-4xl">{title}</h2>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
