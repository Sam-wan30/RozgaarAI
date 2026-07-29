import { useEffect, useRef, useState } from "react";
import {
  BadgeCheck,
  BarChart3,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  HandHeart,
  IdCard,
  Landmark,
  PlayCircle,
  ShieldCheck,
  UserRound,
  Users
} from "lucide-react";

const workspaceCanvas = { width: 1040, height: 560 };

const metricConfig = [
  [Users, "248", "workersReady", "viewWorkers", "blue"],
  [GraduationCap, "72", "trainingPending", "reviewNow", "green"],
  [BriefcaseBusiness, "35", "openRequirements", "viewJobs", "purple"],
  [ShieldCheck, "19", "consentRequests", "viewRequests", "amber"]
];

const pipelineConfig = [
  [UserRound, "01", "onboard", "blue"],
  [GraduationCap, "02", "trainVerify", "teal"],
  [Users, "03", "ready", "green"],
  [HandHeart, "04", "introduced", "purple"],
  [BriefcaseBusiness, "05", "placed", "orange"]
];

const jobConfig = [
  ["salesAssociate", "Retail Pvt. Ltd.", 32],
  ["machineOperator", "Shakti Manufacturing", 18],
  ["fieldTechnician", "Green Infra Solutions", 27],
  ["deliveryExecutive", "SpeedX Logistics", 41]
];

const navConfig = [
  [BarChart3, "overview", true],
  [Users, "workers"],
  [UserRound, "addWorker"],
  [GraduationCap, "training"],
  [ClipboardCheck, "certificates"],
  [ShieldCheck, "placementPipeline"],
  [Building2, "employers"],
  [BriefcaseBusiness, "jobOpportunities"],
  [BarChart3, "reports"],
  [BadgeCheck, "settings"]
];

function EcosystemNode({ type, Icon, title, children }) {
  return (
    <div className={`ngo-ecosystem-node ${type}`}>
      <span className="ngo-ecosystem-icon"><Icon aria-hidden="true" /></span>
      <strong>{title}</strong>
      <p>{children}</p>
    </div>
  );
}

function EcosystemDiagram({ copy }) {
  return (
    <div id="ngo-ecosystem-diagram" className="ngo-ecosystem-diagram" aria-label={copy.ariaLabel}>
      <svg className="ngo-ecosystem-lines" viewBox="0 0 560 230" aria-hidden="true">
        <defs>
          <marker id="ngoArrowBlue" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
          </marker>
          <marker id="ngoArrowPurple" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" fill="#8b5cf6" />
          </marker>
        </defs>
        <path d="M112 126 C164 86 225 66 278 66 C335 66 398 87 449 126" className="is-dotted" markerEnd="url(#ngoArrowPurple)" />
        <path d="M448 166 C376 215 190 215 112 166" className="is-return" markerEnd="url(#ngoArrowBlue)" />
        <path d="M158 130 L222 130" className="is-solid" markerEnd="url(#ngoArrowBlue)" />
        <path d="M338 130 L402 130" className="is-solid purple" markerEnd="url(#ngoArrowPurple)" />
      </svg>
      <EcosystemNode type="worker" Icon={Users} title={copy.workers.title}>
        {copy.workers.copy}
      </EcosystemNode>
      <EcosystemNode type="ngo" Icon={Landmark} title={copy.ngo.title}>
        {copy.ngo.copy}
      </EcosystemNode>
      <EcosystemNode type="employer" Icon={BriefcaseBusiness} title={copy.employers.title}>
        {copy.employers.copy}
      </EcosystemNode>
    </div>
  );
}

function PreviewSidebar({ logoMark, copy }) {
  return (
    <aside className="ngo-preview-sidebar">
      <div className="ngo-preview-brand">
        <img src={logoMark} alt="RozgaarAI" />
        <div>
          <strong>RozgaarAI</strong>
          <span>{copy.title}</span>
        </div>
      </div>
      <nav aria-label={copy.navigationAria}>
        {navConfig.map(([Icon, key, active]) => (
          <span key={key} className={active ? "is-active" : ""}>
            <Icon aria-hidden="true" />
            {copy.navigation[key]}
          </span>
        ))}
      </nav>
      <div className="ngo-preview-privacy">
        <ShieldCheck aria-hidden="true" />
        <strong>{copy.securePrivate}<br />{copy.workerFirst}</strong>
        <p>{copy.workerConsent}</p>
      </div>
    </aside>
  );
}

function MetricCard({ metric, copy }) {
  const [Icon, value, labelKey, actionKey, tone] = metric;
  return (
    <article className={`ngo-preview-metric ${tone}`}>
      <span><Icon aria-hidden="true" /></span>
      <strong>{value}</strong>
      <p>{copy.metrics[labelKey]}</p>
      <a href="#ngo-product-story" onClick={(event) => event.preventDefault()}>{copy.actions[actionKey]} <ChevronRight aria-hidden="true" /></a>
    </article>
  );
}

function JourneyPipeline({ copy }) {
  return (
    <section className="ngo-preview-panel ngo-preview-pipeline" aria-label={copy.title}>
      <h4>{copy.title}</h4>
      <div className="ngo-pipeline-flow">
        {pipelineConfig.map(([Icon, number, key, tone], index) => (
          <div key={key} className={`ngo-pipeline-step ${tone}`}>
            <span className="step-icon"><Icon aria-hidden="true" /></span>
            <small>{number}</small>
            <strong>{copy.steps[key].title}</strong>
            <p>{copy.steps[key].copy}</p>
            {index < pipelineConfig.length - 1 && <ChevronRight className="step-arrow" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </section>
  );
}

function ActiveJobsPanel({ copy }) {
  return (
    <aside className="ngo-preview-panel ngo-preview-jobs">
      <div className="ngo-preview-panel-head">
        <h4>{copy.title}</h4>
        <a href="#ngo-product-story" onClick={(event) => event.preventDefault()}>{copy.viewAll} <ChevronRight aria-hidden="true" /></a>
      </div>
      <div className="ngo-job-list">
        {jobConfig.map(([titleKey, company, matchCount]) => (
          <div key={titleKey} className="ngo-job-row">
            <span><BriefcaseBusiness aria-hidden="true" /></span>
            <div>
              <strong>{copy.titles[titleKey]}</strong>
              <p>{company}</p>
            </div>
            <em>{copy.matches.replace("{count}", matchCount)}</em>
          </div>
        ))}
      </div>
    </aside>
  );
}

function NgoWorkspacePreview({ logoMark, copy }) {
  return (
    <div className="ngo-browser-preview">
      <div className="ngo-browser-bar">
        <span className="dot red" />
        <span className="dot amber" />
        <span className="dot green" />
        <p>rozgaar.ai&nbsp; / &nbsp;ngo-workspace</p>
      </div>
      <div className="ngo-preview-body">
        <PreviewSidebar logoMark={logoMark} copy={copy.ngoWorkspace} />
        <main className="ngo-preview-main">
          <header className="ngo-preview-topbar">
            <div>
              <div className="ngo-preview-orgline">
                <h3>Sakhi Foundation</h3>
                <span><CheckCircle2 aria-hidden="true" /> {copy.ngoWorkspace.verifiedNgo}</span>
              </div>
              <p>{copy.ngoWorkspace.orgTagline}</p>
            </div>
            <div className="ngo-preview-admin">
              <button type="button" aria-label={copy.ngoWorkspace.notifications}><Bell aria-hidden="true" /></button>
              <span>NV</span>
              <div>
                <strong>Neha Verma</strong>
                <small>{copy.ngoWorkspace.admin}</small>
              </div>
            </div>
          </header>

          <section className="ngo-preview-glance">
            <div className="ngo-preview-title-row">
              <h4>{copy.dashboard.todayAtGlance}</h4>
              <span>{copy.dashboard.demoData}</span>
            </div>
            <div className="ngo-metric-grid">
              {metricConfig.map((metric) => <MetricCard key={metric[1]} metric={metric} copy={copy.dashboard} />)}
            </div>
          </section>

          <div className="ngo-preview-lower-grid">
            <JourneyPipeline copy={copy.pipeline} />
            <ActiveJobsPanel copy={copy.jobs} />
          </div>

          <section className="ngo-preview-activity">
            <h4>{copy.activity.title}</h4>
            <div>
              <ClipboardCheck aria-hidden="true" />
              <p>{copy.activity.trainingCompleted}</p>
              <span>{copy.activity.twoHoursAgo}</span>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function WorkspacePreviewScaler({ children }) {
  const frameRef = useRef(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return undefined;

    const updateScale = () => {
      const rect = frame.getBoundingClientRect();
      const desktop = window.matchMedia("(min-width: 1200px)").matches;
      const heightScale = desktop && rect.height > 0 ? rect.height / workspaceCanvas.height : 1;
      const nextScale = Math.min(
        rect.width / workspaceCanvas.width,
        heightScale,
        1
      );
      setScale(Number.isFinite(nextScale) && nextScale > 0 ? nextScale : 1);
    };

    updateScale();
    const observer = new ResizeObserver(updateScale);
    observer.observe(frame);
    window.addEventListener("resize", updateScale);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", updateScale);
    };
  }, []);

  return (
    <div className="ngo-preview-scale-wrap" ref={frameRef}>
      <div
        className="ngo-preview-canvas-box"
        style={{
          width: `${workspaceCanvas.width * scale}px`,
          height: `${workspaceCanvas.height * scale}px`
        }}
      >
        <div
          className="ngo-preview-canvas"
          style={{
            width: `${workspaceCanvas.width}px`,
            height: `${workspaceCanvas.height}px`,
            transform: `scale(${scale})`
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function BenefitBand({ copy, onExploreNgo, onShowEcosystem }) {
  const benefits = [
    [IdCard, copy.workerOwnedIdentity.title, copy.workerOwnedIdentity.copy],
    [HandHeart, copy.trustedAssistance.title, copy.trustedAssistance.copy],
    [ShieldCheck, copy.consentBasedHiring.title, copy.consentBasedHiring.copy]
  ];

  return (
    <div className="ngo-benefit-band">
      <div className="ngo-benefit-inner">
        <div className="ngo-benefit-list">
          {benefits.map(([Icon, title, copy]) => (
            <article key={title} className="ngo-benefit-item">
              <span><Icon aria-hidden="true" /></span>
              <div>
                <h3>{title}</h3>
                <p>{copy}</p>
              </div>
            </article>
          ))}
        </div>
        <div className="ngo-benefit-actions">
          <button type="button" className="ngo-benefit-primary focus-ring" onClick={onExploreNgo}>
            <Building2 aria-hidden="true" />
            {copy.actions.exploreWorkspace}
            <ChevronRight aria-hidden="true" />
          </button>
          <button type="button" className="ngo-benefit-secondary focus-ring" onClick={onShowEcosystem}>
            <PlayCircle aria-hidden="true" />
            {copy.actions.seeEcosystem}
          </button>
          <p>{copy.workspaceActionHint}</p>
        </div>
      </div>
    </div>
  );
}

export function NgoProductStory({ copy, logoMark, onExploreNgo }) {
  const showEcosystem = () => {
    document.getElementById("ngo-ecosystem-diagram")?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section id="ngo-product-story" className="ngo-product-story" aria-labelledby="ngo-product-story-title">
      <div className="ngo-product-dots" aria-hidden="true" />
      <div className="ngo-product-arc" aria-hidden="true" />
      <div className="ngo-product-shell">
        <header className="ngo-product-header">
          <p><span /> {copy.hero.eyebrow} <span /></p>
          <h2 id="ngo-product-story-title">
            {copy.hero.headingPrefix} <span>{copy.hero.headingAccent}</span>
          </h2>
          <p>
            {copy.hero.description}
          </p>
        </header>

        <div className="ngo-product-grid">
          <aside className="ngo-product-copy">
            <p>{copy.approach.eyebrow}</p>
            <h3>
              {copy.approach.ngosPrefix} <span className="blue">{copy.approach.ngosAccent}</span><br />
              {copy.approach.workersPrefix} <span className="green">{copy.approach.workersAccent}</span><br />
              {copy.approach.employersPrefix} <span className="purple">{copy.approach.employersAccent}</span>
            </h3>
            <p>
              {copy.approach.description}
            </p>
            <EcosystemDiagram copy={copy.ecosystem} />
          </aside>

          <WorkspacePreviewScaler>
            <NgoWorkspacePreview logoMark={logoMark} copy={copy} />
          </WorkspacePreviewScaler>
        </div>
      </div>
      <BenefitBand copy={copy.features} onExploreNgo={onExploreNgo} onShowEcosystem={showEcosystem} />
    </section>
  );
}
