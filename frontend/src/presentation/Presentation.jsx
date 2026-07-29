import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ClipboardList,
  Download,
  Eye,
  FileText,
  Fingerprint,
  Gauge,
  Grid2X2,
  Handshake,
  IdCard,
  Link2,
  Maximize2,
  Mic,
  Network,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  WalletCards,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { slides } from "./presentationSlides";
import "./presentation.css";

const iconMap = {
  registration: ClipboardList,
  uan: Fingerprint,
  welfare: ShieldCheck,
  database: Building2,
  resume: FileText,
  jobs: BriefcaseBusiness,
  income: WalletCards,
  interview: Users,
  voice: Mic,
  ai: Sparkles,
  identity: IdCard,
  share: QrCode,
  ecosystem: Network
};

function useKeyboardNavigation(onPrevious, onNext, disabled) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (disabled) return;
      if (event.key === "ArrowLeft") onPrevious();
      if (event.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [disabled, onNext, onPrevious]);
}

export function FeatureCard({ icon = "identity", title, tone = "blue" }) {
  const Icon = iconMap[icon] || CheckCircle2;
  return (
    <article className={`feature-card feature-card-${tone}`}>
      <span className="feature-icon"><Icon aria-hidden="true" /></span>
      <span>{title}</span>
    </article>
  );
}

export function ComparisonTable({ rows }) {
  return (
    <div className="comparison-table" role="table" aria-label="e-Shram and RozgaarAI comparison">
      <div className="comparison-row comparison-head" role="row">
        <span role="columnheader">Dimension</span>
        <span role="columnheader">e-Shram</span>
        <span role="columnheader">RozgaarAI</span>
      </div>
      {rows.map(([label, eshram, rozgaar]) => (
        <div className="comparison-row" role="row" key={label}>
          <strong role="cell">{label}</strong>
          <span role="cell">{eshram}</span>
          <span role="cell">{rozgaar}</span>
        </div>
      ))}
    </div>
  );
}

export function ProcessFlow({ steps }) {
  return (
    <ol className="process-flow" aria-label="RozgaarAI worker journey">
      {steps.map((step, index) => (
        <li key={step}>
          <span>{String(index + 1).padStart(2, "0")}</span>
          <p>{step}</p>
        </li>
      ))}
    </ol>
  );
}

function Highlight({ children }) {
  return (
    <div className="slide-highlight">
      <Sparkles aria-hidden="true" />
      <strong>{children}</strong>
    </div>
  );
}

function SplitIdentityVisual() {
  return (
    <div className="split-visual" aria-label="Traditional identity card and dynamic worker profile">
      <div className="identity-card static-card">
        <span className="card-chip"><Fingerprint aria-hidden="true" /></span>
        <p>Registered Worker</p>
        <strong>Identity Record</strong>
        <small>Number, category, eligibility</small>
      </div>
      <div className="identity-card dynamic-card">
        <span className="card-chip"><Sparkles aria-hidden="true" /></span>
        <p>RozgaarAI Profile</p>
        <strong>Career Passport</strong>
        <small>Skills, resume, jobs, wages</small>
        <div className="profile-metrics">
          <span>Resume ready</span>
          <span>QR shareable</span>
        </div>
      </div>
    </div>
  );
}

function ResearchTimeline({ questions }) {
  return (
    <div className="timeline">
      {["Build", "Research", "Discover", "Extend"].map((item, index) => (
        <div className="timeline-node" key={item}>
          <span>{index + 1}</span>
          <strong>{item}</strong>
          <small>{questions[index - 1] || "RozgaarAI product question"}</small>
        </div>
      ))}
    </div>
  );
}

function RegistryDiagram() {
  return (
    <div className="registry-grid">
      {[
        ["registration", "Registration"],
        ["uan", "Universal Account Number"],
        ["welfare", "Welfare delivery"],
        ["database", "National database"]
      ].map(([icon, title]) => (
        <FeatureCard key={title} icon={icon} title={title} />
      ))}
    </div>
  );
}

function ProblemMap({ problems }) {
  return (
    <div className="problem-map">
      <div className="worker-core">
        <Users aria-hidden="true" />
        <strong>Worker</strong>
        <small>Registered, but not yet employer-visible</small>
      </div>
      {problems.map((problem, index) => (
        <span key={problem} className={`problem-pill problem-${index + 1}`}>{problem}</span>
      ))}
    </div>
  );
}

function CapabilityNetwork({ features }) {
  const icons = ["voice", "resume", "identity", "income", "jobs", "interview", "share", "ai"];
  return (
    <div className="capability-network">
      <div className="network-center">
        <Sparkles aria-hidden="true" />
        <strong>Digital Worker Profile</strong>
        <small>Voice data becomes employment intelligence</small>
      </div>
      <div className="network-grid">
        {features.map((feature, index) => (
          <FeatureCard key={feature} icon={icons[index]} title={feature} tone={index % 2 ? "green" : "blue"} />
        ))}
      </div>
    </div>
  );
}

function ConnectedSystems({ slide }) {
  return (
    <div className="systems-diagram">
      <SystemPanel title={slide.leftTitle} items={slide.leftItems} icon={Building2} />
      <div className="equation-badge">
        <Handshake aria-hidden="true" />
        <strong>{slide.equation}</strong>
      </div>
      <SystemPanel title={slide.rightTitle} items={slide.rightItems} icon={Sparkles} accent />
    </div>
  );
}

function SystemPanel({ title, items, icon: Icon, accent = false }) {
  return (
    <article className={`system-panel ${accent ? "system-accent" : ""}`}>
      <span><Icon aria-hidden="true" /></span>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </article>
  );
}

function EcosystemDiagram({ integrations }) {
  return (
    <div className="ecosystem-diagram">
      <div className="ecosystem-center">
        <Network aria-hidden="true" />
        <strong>RozgaarAI</strong>
        <small>Worker-owned career identity</small>
      </div>
      {integrations.map((item, index) => (
        <span key={item} className={`ecosystem-node ecosystem-node-${index + 1}`}>{item}</span>
      ))}
    </div>
  );
}

function ClosingVisual({ statements }) {
  return (
    <div className="closing-visual">
      {statements.map(([label, answer]) => (
        <article key={label}>
          <span>{label}</span>
          <strong>{answer}</strong>
        </article>
      ))}
    </div>
  );
}

function SlideVisual({ slide }) {
  if (slide.visual === "split-identity") return <SplitIdentityVisual />;
  if (slide.visual === "research-timeline") return <ResearchTimeline questions={slide.questions} />;
  if (slide.visual === "registry-diagram") return <RegistryDiagram />;
  if (slide.visual === "problem-map") return <ProblemMap problems={slide.problems} />;
  if (slide.visual === "capability-network") return <CapabilityNetwork features={slide.features} />;
  if (slide.visual === "comparison-table") return <ComparisonTable rows={slide.comparison} />;
  if (slide.visual === "process-flow") return <ProcessFlow steps={slide.steps} />;
  if (slide.visual === "connected-systems") return <ConnectedSystems slide={slide} />;
  if (slide.visual === "ecosystem") return <EcosystemDiagram integrations={slide.integrations} />;
  if (slide.visual === "closing") return <ClosingVisual statements={slide.statements} />;
  return null;
}

export function SlideLayout({ slide, index, total }) {
  const featureIcons = ["voice", "resume", "identity", "income", "jobs", "interview", "share", "database"];
  const isComparison = slide.visual === "comparison-table";
  const isJourney = slide.visual === "process-flow";
  const isTitle = slide.id === "title";

  return (
    <section className={`presentation-slide ${isTitle ? "title-slide" : ""}`} aria-label={`Slide ${index + 1}: ${slide.heading}`}>
      <div className="slide-shell">
        <header className="slide-header">
          <span>{slide.eyebrow}</span>
          <small>{index + 1} / {total}</small>
        </header>
        <div className={`slide-content ${isComparison || isJourney ? "slide-content-wide" : ""}`}>
          <div className="slide-copy">
            <h1>{slide.heading}</h1>
            {slide.subheading && <h2>{slide.subheading}</h2>}
            {slide.body && <p className="slide-body">{slide.body}</p>}
            {slide.questions && (
              <ol className="question-list">
                {slide.questions.map((question) => <li key={question}>{question}</li>)}
              </ol>
            )}
            {slide.features && slide.visual !== "capability-network" && (
              <div className="feature-list">
                {slide.features.map((feature, featureIndex) => (
                  <FeatureCard key={feature} icon={featureIcons[featureIndex]} title={feature} tone={featureIndex % 2 ? "green" : "blue"} />
                ))}
              </div>
            )}
            {slide.note && <p className="slide-note">{slide.note}</p>}
            {slide.takeaway && <p className="takeaway">{slide.takeaway}</p>}
            {slide.closing && <p className="closing-line">{slide.closing}</p>}
            {slide.highlight && <Highlight>{slide.highlight}</Highlight>}
            {slide.cta && (
              <a className="prototype-link" href="/" aria-label="Explore the RozgaarAI prototype">
                <Eye aria-hidden="true" />
                {slide.cta}
              </a>
            )}
          </div>
          <div className="slide-visual">
            <SlideVisual slide={slide} />
          </div>
        </div>
        {slide.footer && <footer className="slide-footer">{slide.footer}</footer>}
      </div>
    </section>
  );
}

export function ProgressBar({ current, total }) {
  return (
    <div className="deck-progress" aria-hidden="true">
      <span style={{ width: `${((current + 1) / total) * 100}%` }} />
    </div>
  );
}

export function Navigation({ current, total, onPrevious, onNext, onOverview, onFullscreen, onPrint }) {
  return (
    <nav className="deck-controls" aria-label="Presentation controls">
      <button type="button" onClick={onPrevious} disabled={current === 0} aria-label="Previous slide">
        <ArrowLeft aria-hidden="true" />
      </button>
      <strong>{current + 1} / {total}</strong>
      <button type="button" onClick={onNext} disabled={current === total - 1} aria-label="Next slide">
        <ArrowRight aria-hidden="true" />
      </button>
      <button type="button" onClick={onOverview} aria-label="Show slide overview">
        <Grid2X2 aria-hidden="true" />
      </button>
      <button type="button" onClick={onFullscreen} aria-label="Enter full-screen presentation">
        <Maximize2 aria-hidden="true" />
      </button>
      <button type="button" onClick={onPrint} aria-label="Print or export presentation">
        <Printer aria-hidden="true" />
      </button>
    </nav>
  );
}

function OverviewModal({ current, onClose, onSelect }) {
  return (
    <div className="overview-backdrop" role="dialog" aria-modal="true" aria-label="Slide overview">
      <div className="overview-panel">
        <div className="overview-header">
          <div>
            <span>Slide overview</span>
            <h2>Jump to any part of the story</h2>
          </div>
          <button type="button" onClick={onClose} aria-label="Close slide overview"><X aria-hidden="true" /></button>
        </div>
        <div className="overview-grid">
          {slides.map((slide, index) => (
            <button
              type="button"
              className={index === current ? "overview-card overview-active" : "overview-card"}
              key={slide.id}
              onClick={() => onSelect(index)}
            >
              <small>{index + 1}</small>
              <strong>{slide.heading}</strong>
              <span>{slide.eyebrow}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function PrintableSlides() {
  return (
    <div className="print-deck" aria-hidden="true">
      {slides.map((slide, index) => (
        <SlideLayout key={slide.id} slide={slide} index={index} total={slides.length} />
      ))}
    </div>
  );
}

export default function Presentation() {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [overviewOpen, setOverviewOpen] = useState(false);
  const total = slides.length;

  const goTo = (nextIndex) => {
    setDirection(nextIndex > current ? 1 : -1);
    setCurrent(Math.max(0, Math.min(total - 1, nextIndex)));
  };
  const goPrevious = () => goTo(current - 1);
  const goNext = () => goTo(current + 1);

  useKeyboardNavigation(goPrevious, goNext, overviewOpen);

  const transition = useMemo(() => ({
    initial: (dir) => ({ opacity: 0, x: dir > 0 ? 32 : -32 }),
    animate: { opacity: 1, x: 0 },
    exit: (dir) => ({ opacity: 0, x: dir > 0 ? -32 : 32 })
  }), []);

  const enterFullscreen = () => {
    const root = document.documentElement;
    if (!document.fullscreenElement) root.requestFullscreen?.();
  };

  return (
    <main className="presentation-root">
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slides[current].id}
          custom={direction}
          variants={transition}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          <SlideLayout slide={slides[current]} index={current} total={total} />
        </motion.div>
      </AnimatePresence>
      <Navigation
        current={current}
        total={total}
        onPrevious={goPrevious}
        onNext={goNext}
        onOverview={() => setOverviewOpen(true)}
        onFullscreen={enterFullscreen}
        onPrint={() => window.print()}
      />
      <ProgressBar current={current} total={total} />
      {overviewOpen && (
        <OverviewModal
          current={current}
          onClose={() => setOverviewOpen(false)}
          onSelect={(index) => {
            goTo(index);
            setOverviewOpen(false);
          }}
        />
      )}
      <PrintableSlides />
    </main>
  );
}
