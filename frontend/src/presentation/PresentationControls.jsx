import { Download, FileArchive, Maximize2, Minimize2 } from "lucide-react";
import logoNavbar from "../assets/brand/rozgaarai-navbar-logo.png";

export function PresentationControls({
  isFullscreen,
  downloadFiles,
  controlsHidden,
  onToggleFullscreen
}) {
  const FullscreenIcon = isFullscreen ? Minimize2 : Maximize2;

  return (
    <header className={`presentation-topbar${controlsHidden ? " controls-hidden" : ""}`}>
      <div className="presentation-nav-section presentation-brand-section">
        <img className="presentation-rozgaar-logo" src={logoNavbar} alt="RozgaarAI" />
        <div className="presentation-brand-copy">
          <strong>RozgaarAI</strong>
          <span>Pitch Deck</span>
          <small>Voice-first AI Employment Platform</small>
        </div>
      </div>
      <div className="presentation-nav-section presentation-sama-section">
        <img src="/presentation/sama-social-logo.png" alt="Sama Social" />
      </div>
      <div className="presentation-nav-section presentation-hackathon-section">
        <strong>Build for Good Hackathon 2026</strong>
        <span>Theme: ROZGAAR</span>
      </div>
      <div className="presentation-nav-section presentation-actions">
        <a href={downloadFiles.pdf} download="RozgaarAI-Presentation.pdf" aria-label="Download presentation as PDF">
          <Download aria-hidden="true" />
          <span>PDF</span>
        </a>
        <a href={downloadFiles.pptx} download="RozgaarAI-Presentation.pptx" aria-label="Download presentation as PowerPoint">
          <FileArchive aria-hidden="true" />
          <span>PPT</span>
        </a>
        <button type="button" onClick={onToggleFullscreen} aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}>
          <FullscreenIcon aria-hidden="true" />
          <span>{isFullscreen ? "Exit" : "Full"}</span>
        </button>
      </div>
    </header>
  );
}
