import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  Download,
  FileText,
  Gauge,
  Globe2,
  Handshake,
  IdCard,
  MapPin,
  Mic,
  Printer,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import logoFull from "../assets/brand/rozgaarai-logo-full-transparent.png";
import logoMark from "../assets/brand/rozgaarai-logo-mark.png";
import ngoPhoto from "../assets/ngo-team-workspace-hero.png";
import titleSlideImage from "../assets/presentation-title-slide.png";
import employerPhoto from "../assets/rahul-kumar-electrician.jpg";
import workerPhoto from "../assets/workers/asha-kumari-domestic-worker.jpg";
import { slides } from "./presentationSlides";
import "./presentation.css";

const worker = {
  name: "Asha Kumari",
  role: "Domestic Worker",
  city: "Delhi",
  readiness: 92,
  match: 98,
  id: "RZG-DEL-DOM-3210"
};

function clampSlide(index) {
  return Math.max(0, Math.min(slides.length - 1, index));
}

function MiniMetric({ label, value, tone = "blue" }) {
  return (
    <article className={`mini-metric ${tone}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </article>
  );
}

function Pill({ icon: Icon = CheckCircle2, children }) {
  return (
    <span className="pill">
      <Icon aria-hidden="true" />
      {children}
    </span>
  );
}

function TitleVisual() {
  const nodes = [
    {
      label: "Worker",
      Icon: Users,
      photo: workerPhoto,
      lines: ["Skills", "Identity", "Opportunities"]
    },
    {
      label: "NGO / Foundation",
      Icon: Handshake,
      photo: ngoPhoto,
      lines: ["Training", "Verification", "Support"]
    },
    {
      label: "Employer",
      Icon: BriefcaseBusiness,
      photo: employerPhoto,
      lines: ["Hiring", "Trust", "Matching"]
    }
  ];
  return (
    <div className="title-ecosystem" aria-label="Worker, NGO and employer connected through RozgaarAI">
      <svg className="hero-connections" viewBox="0 0 620 520" aria-hidden="true">
        <path d="M310 260 C230 110 132 98 86 154" />
        <path d="M310 260 C446 105 536 136 554 218" />
        <path d="M310 260 C372 421 250 467 158 410" />
      </svg>
      <div className="ecosystem-ring ring-one" />
      <div className="ecosystem-ring ring-two" />
      <motion.div className="title-ai-core" animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}>
        <img src={logoMark} alt="RozgaarAI logo mark" />
        <span>RozgaarAI</span>
      </motion.div>
      {nodes.map(({ label, Icon, photo, lines }, index) => (
        <motion.div
          className={`ecosystem-card ecosystem-card-${index + 1}`}
          key={label}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: [0, -4, 0], scale: 1 }}
          transition={{ opacity: { delay: 0.18 * index }, y: { duration: 5 + index, repeat: Infinity, ease: "easeInOut" } }}
        >
          <img src={photo} alt="" />
          <div className="ecosystem-card-copy">
            <div className="ecosystem-card-heading">
              <span><Icon aria-hidden="true" /></span>
              <strong>{label}</strong>
            </div>
            <small>{lines.join(" · ")}</small>
          </div>
        </motion.div>
      ))}
      <div className="connection-node node-one" />
      <div className="connection-node node-two" />
      <div className="connection-node node-three" />
      <div className="voice-wave"><span /><span /><span /><span /><span /><span /><span /></div>
    </div>
  );
}

function TitleCopy({ slide }) {
  const features = [
    [Mic, "Voice-first Onboarding"],
    [IdCard, "AI Digital Identity"],
    [Handshake, "Trusted Matching"],
    [TrendingUp, "Better Employment"]
  ];
  return (
    <div className="title-copy">
      <motion.div className="title-brand-lockup" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
        <img src={logoFull} alt="RozgaarAI" />
        <p>{slide.subtitle}</p>
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.72, delay: 0.1 }}>
        <span>ROZGAAR.</span>
        <span className="gradient-text">REIMAGINED.</span>
      </motion.h1>
      <motion.div className="title-underline" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.72, delay: 0.42 }} />
      <motion.p className="title-support" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.22 }}>
        Helping India&apos;s informal workers build verified digital identities, connect with trusted employers, and unlock better opportunities through AI.
      </motion.p>
      <motion.div className="hackathon-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.32 }}>
        <div>
          <span>Made for</span>
          <strong>Sama Social</strong>
        </div>
        <div>
          <span>Build for Good</span>
          <strong>Hackathon</strong>
        </div>
        <div>
          <span>Hackathon Theme</span>
          <strong className="gradient-text">Rozgaar</strong>
        </div>
      </motion.div>
      <div className="title-features">
        {features.map(([Icon, label], index) => (
          <motion.article key={label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + index * 0.08 }}>
            <span><Icon aria-hidden="true" /></span>
            <strong>{label}</strong>
          </motion.article>
        ))}
      </div>
      <p className="title-bottom-line">Let&apos;s build a more inclusive future together.</p>
    </div>
  );
}

function ProblemVisual({ points }) {
  return (
    <div className="problem-board">
      <div className="worker-shadow-card">
        <Users aria-hidden="true" />
        <strong>Skilled but unseen</strong>
        <span>No proof layer</span>
      </div>
      <div className="problem-stack">
        {points.map((point, index) => (
          <motion.article className="problem-card" key={point} initial={{ x: 42, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.08 }}>
            <span>0{index + 1}</span>
            <p>{point}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}

function BrokenFlow() {
  return (
    <div className="broken-flow">
      {["Worker profile", "Employer profile", "Still no trust", "No verification", "No readiness", "No support"].map((item, index) => (
        <div className={`flow-fragment ${index > 1 ? "is-broken" : ""}`} key={item}>
          <span>{index < 2 ? <IdCard aria-hidden="true" /> : <ShieldCheck aria-hidden="true" />}</span>
          <strong>{item}</strong>
          {index < 5 && <ChevronRight aria-hidden="true" />}
        </div>
      ))}
    </div>
  );
}

function SolutionFlow({ flow }) {
  const icons = [Mic, Sparkles, IdCard, Gauge, BriefcaseBusiness, WalletCards, ShieldCheck, QrCode];
  return (
    <div className="solution-flow">
      {flow.map((step, index) => {
        const Icon = icons[index] || CheckCircle2;
        return (
          <motion.article className="solution-step" key={step} initial={{ opacity: 0, y: 26 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06 }}>
            <span><Icon aria-hidden="true" /></span>
            <strong>{step}</strong>
          </motion.article>
        );
      })}
    </div>
  );
}

function WorkerDashboard() {
  return (
    <div className="dashboard-mock worker-mock">
      <header>
        <div>
          <small>Worker Workspace</small>
          <h3>{worker.name}</h3>
          <p>{worker.role} • {worker.city}</p>
        </div>
        <span className="verified-badge"><BadgeCheck aria-hidden="true" /> Verified</span>
      </header>
      <div className="dashboard-grid">
        <section className="id-preview">
          <IdCard aria-hidden="true" />
          <strong>Digital Worker ID</strong>
          <span>{worker.id}</span>
          <div className="qr-tile"><QrCode aria-hidden="true" /><small>QR profile card</small></div>
        </section>
        <section className="score-ring">
          <div style={{ "--score": `${worker.readiness * 3.6}deg` }}>
            <strong>{worker.readiness}%</strong>
          </div>
          <span>Employment readiness</span>
        </section>
        <section className="job-card">
          <small>Best match</small>
          <strong>{worker.match}% Urban Homes Services</strong>
          <span>Domestic care • Delhi • Verified employer</span>
        </section>
        <section className="wage-card">
          <WalletCards aria-hidden="true" />
          <strong>₹20,000</strong>
          <span>Expected monthly wage tracked</span>
        </section>
      </div>
    </div>
  );
}

function EmployerDashboard() {
  const rows = [
    ["Asha Kumari", "Domestic Worker", "Delhi", "92%", "Shortlist"],
    ["Ramesh Patel", "Plumber", "Bhopal", "95%", "View profile"],
    ["Rekha Devi", "Tailor", "Raipur", "90%", "Connect"]
  ];
  return (
    <div className="dashboard-mock employer-mock">
      <header>
        <div>
          <small>Employer Workspace</small>
          <h3>Verified worker search</h3>
        </div>
        <Search aria-hidden="true" />
      </header>
      <div className="filter-row">
        <Pill icon={Search}>Skill</Pill>
        <Pill icon={MapPin}>Location</Pill>
        <Pill icon={Gauge}>Readiness</Pill>
        <Pill icon={ShieldCheck}>Consented profiles</Pill>
      </div>
      <div className="worker-table">
        {rows.map((row) => (
          <article key={row[0]}>
            <strong>{row[0]}</strong>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
            <span>{row[3]}</span>
            <button>{row[4]}</button>
          </article>
        ))}
      </div>
    </div>
  );
}

function NgoDashboard({ metrics }) {
  return (
    <div className="dashboard-mock ngo-mock">
      <header>
        <div>
          <small>NGO / Foundation Workspace</small>
          <h3>Placement operating system</h3>
        </div>
        <span className="verified-badge"><Building2 aria-hidden="true" /> Verified NGO</span>
      </header>
      <div className="ngo-metrics">
        {metrics.map((metric, index) => {
          const [value, ...label] = metric.split(" ");
          return <MiniMetric key={metric} value={value} label={label.join(" ")} tone={index % 2 ? "green" : "blue"} />;
        })}
      </div>
      <div className="pipeline">
        {["Enrolled", "Training", "Credentials", "Matched", "Placed"].map((step, index) => (
          <article key={step}>
            <span>{index + 1}</span>
            <strong>{step}</strong>
          </article>
        ))}
      </div>
      <div className="demand-card">
        <TrendingUp aria-hidden="true" />
        <p>Employer demand is mapped to worker readiness, credentials and consent.</p>
      </div>
    </div>
  );
}

function EcosystemDiagram() {
  const nodes = [
    ["Worker", Users, "Digital identity"],
    ["NGO / Skill Foundation", Handshake, "Training + verification"],
    ["RozgaarAI", Sparkles, "Consent + matching"],
    ["Employer", BriefcaseBusiness, "Verified hiring"],
    ["Better Jobs", TrendingUp, "Income growth"]
  ];
  return (
    <div className="ecosystem-line">
      {nodes.map(([label, Icon, copy], index) => (
        <article key={label} className="ecosystem-node">
          <span><Icon aria-hidden="true" /></span>
          <strong>{label}</strong>
          <small>{copy}</small>
          {index < nodes.length - 1 && <div className="connector" />}
        </article>
      ))}
    </div>
  );
}

function FeatureGalaxy({ features }) {
  const icons = [Mic, FileText, QrCode, IdCard, Search, Building2, WalletCards, ShieldCheck, Globe2];
  return (
    <div className="feature-galaxy">
      {features.map((feature, index) => {
        const Icon = icons[index] || CheckCircle2;
        return (
          <motion.article key={feature} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: index * 0.04 }}>
            <Icon aria-hidden="true" />
            <span>{feature}</span>
          </motion.article>
        );
      })}
    </div>
  );
}

function ImpactVisual({ lines }) {
  return (
    <div className="impact-wall">
      {lines.map((line, index) => (
        <motion.article key={line} initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }}>
          <span>0{index + 1}</span>
          <strong>{line}</strong>
        </motion.article>
      ))}
    </div>
  );
}

function JourneyVisual({ steps }) {
  const icons = [Mic, Sparkles, BadgeCheck, Search, TrendingUp];
  return (
    <div className="journey-track">
      {steps.map((step, index) => {
        const Icon = icons[index];
        return (
          <article key={step}>
            <span><Icon aria-hidden="true" /></span>
            <strong>{step}</strong>
          </article>
        );
      })}
    </div>
  );
}

function SlideVisual({ slide }) {
  if (slide.type === "title") return <TitleVisual />;
  if (slide.type === "problem") return <ProblemVisual points={slide.points} />;
  if (slide.type === "broken-flow") return <BrokenFlow />;
  if (slide.type === "solution-flow") return <SolutionFlow flow={slide.flow} />;
  if (slide.type === "worker-dashboard") return <WorkerDashboard />;
  if (slide.type === "employer-dashboard") return <EmployerDashboard />;
  if (slide.type === "ngo-dashboard") return <NgoDashboard metrics={slide.metrics} />;
  if (slide.type === "ecosystem") return <EcosystemDiagram />;
  if (slide.type === "features") return <FeatureGalaxy features={slide.features} />;
  if (slide.type === "impact") return <ImpactVisual lines={slide.lines} />;
  if (slide.type === "journey") return <JourneyVisual steps={slide.steps} />;
  return <TitleVisual />;
}

function SlideCopy({ slide }) {
  if (slide.type === "title") return <TitleCopy slide={slide} />;

  return (
    <div className="slide-copy">
      <p className="slide-kicker">{slide.kicker}</p>
      <h1>{slide.title}</h1>
      {slide.subtitle && <p className="slide-subtitle">{slide.subtitle}</p>}
      {slide.type === "problem" && (
        <div className="compact-points">
          {slide.points.map((point) => <Pill key={point}>{point}</Pill>)}
        </div>
      )}
      {slide.type === "closing" && (
        <div className="closing-cta">
          <Sparkles aria-hidden="true" />
          <strong>{slide.cta}</strong>
        </div>
      )}
    </div>
  );
}

export default function Presentation() {
  const [current, setCurrent] = useState(0);
  const [pointer, setPointer] = useState({ x: 0, y: 0 });
  const slide = slides[current];
  const progress = useMemo(() => ((current + 1) / slides.length) * 100, [current]);

  const previous = () => setCurrent((value) => clampSlide(value - 1));
  const next = () => setCurrent((value) => clampSlide(value + 1));

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "ArrowLeft") previous();
      if (event.key === "ArrowRight" || event.key === " ") next();
      if (event.key === "Home") setCurrent(0);
      if (event.key === "End") setCurrent(slides.length - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <main
      className={`presentation-root slide-active-${slide.type}`}
      style={{ "--pointer-x": pointer.x, "--pointer-y": pointer.y }}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPointer({
          x: ((event.clientX - rect.left) / rect.width - 0.5).toFixed(3),
          y: ((event.clientY - rect.top) / rect.height - 0.5).toFixed(3)
        });
      }}
    >
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="presentation-topbar">
        <div className="deck-position" aria-label={`Slide ${current + 1} of ${slides.length}`}>
          <strong>{String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</strong>
          <span><i style={{ width: `${progress}%` }} /></span>
        </div>
        <div className="deck-actions">
          <button type="button" onClick={() => window.print()}><Printer aria-hidden="true" /> Download PDF</button>
          <button type="button" onClick={() => window.print()}><Download aria-hidden="true" /> Download PPT</button>
        </div>
      </div>

      <section className="presentation-stage" aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.article
            key={slide.id}
            className={`presentation-slide slide-${slide.type}`}
            initial={{ opacity: 0, y: 34, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -28, scale: 0.985 }}
            transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="slide-shell">
              {slide.type === "title" ? (
                <img className="title-slide-image" src={titleSlideImage} alt="RozgaarAI opening slide" />
              ) : (
                <>
                  <div className="slide-number">{String(current + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}</div>
                  <SlideCopy slide={slide} />
                  <SlideVisual slide={slide} />
                </>
              )}
            </div>
          </motion.article>
        </AnimatePresence>
      </section>

      <nav className="presentation-controls" aria-label="Presentation navigation">
        <button type="button" onClick={previous} disabled={current === 0} aria-label="Previous slide"><ArrowLeft aria-hidden="true" /></button>
        <div className="progress-shell"><span style={{ width: `${progress}%` }} /></div>
        <button type="button" onClick={next} disabled={current === slides.length - 1} aria-label="Next slide"><ArrowRight aria-hidden="true" /></button>
      </nav>
    </main>
  );
}
