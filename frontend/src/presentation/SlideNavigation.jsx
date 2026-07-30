import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import { formatSlideNumber } from "./imageUtils";

export function SlideNavigation({
  currentIndex,
  totalSlides,
  controlsHidden,
  onPrevious,
  onNext,
  onOverview
}) {
  const currentSlideNumber = currentIndex + 1;
  const progress = (currentSlideNumber / totalSlides) * 100;

  return (
    <>
      <button
        type="button"
        className={`presentation-arrow arrow-left${controlsHidden ? " controls-hidden" : ""}`}
        onClick={onPrevious}
        disabled={currentIndex === 0}
        aria-label="Go to previous slide"
      >
        <ChevronLeft aria-hidden="true" />
      </button>
      <button
        type="button"
        className={`presentation-arrow arrow-right${controlsHidden ? " controls-hidden" : ""}`}
        onClick={onNext}
        disabled={currentIndex === totalSlides - 1}
        aria-label="Go to next slide"
      >
        <ChevronRight aria-hidden="true" />
      </button>
      <footer className={`presentation-bottombar${controlsHidden ? " controls-hidden" : ""}`}>
        <div className="slide-counter" aria-live="polite">
          {formatSlideNumber(currentSlideNumber)} / {formatSlideNumber(totalSlides)}
        </div>
        <div className="presentation-progress" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
        <button type="button" className="overview-button" onClick={onOverview} aria-label="Open slide overview">
          <LayoutGrid aria-hidden="true" />
          <span>Overview</span>
        </button>
      </footer>
    </>
  );
}
