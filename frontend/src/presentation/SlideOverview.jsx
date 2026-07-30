import { X } from "lucide-react";
import { SlideRenderer } from "./SlideRenderer";
import { formatSlideNumber } from "./imageUtils";

export function SlideOverview({ slides, currentIndex, onSelect, onClose }) {
  return (
    <div className="overview-overlay" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose();
    }}>
      <section className="overview-panel" role="dialog" aria-modal="true" aria-label="Slide overview">
        <header>
          <div>
            <strong>Slide Overview</strong>
            <span>{formatSlideNumber(currentIndex + 1)} / {formatSlideNumber(slides.length)}</span>
          </div>
          <button type="button" onClick={onClose} aria-label="Close slide overview">
            <X aria-hidden="true" />
          </button>
        </header>
        <div className="overview-grid">
          {slides.map((slide, index) => (
            <button
              type="button"
              key={slide.id}
              className={`overview-tile${index === currentIndex ? " is-active" : ""}`}
              onClick={() => onSelect(index)}
              aria-label={`Open slide ${slide.id}`}
            >
              <SlideRenderer slide={slide} isThumbnail />
              <span>{formatSlideNumber(slide.id)}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
