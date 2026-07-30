import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PresentationBackground } from "./PresentationBackground";
import { PresentationControls } from "./PresentationControls";
import { PresentationStage } from "./PresentationStage";
import { SlideNavigation } from "./SlideNavigation";
import { SlideOverview } from "./SlideOverview";
import { downloadFiles, slides } from "./slidesData";
import "./presentation.css";

const swipeThreshold = 56;
const presentationTitle = "RozgaarAI | Build for Good Hackathon Presentation";
const presentationDescription = "Interactive presentation of RozgaarAI, a voice-first AI employment platform connecting informal workers, NGOs, foundations and employers.";

function preloadSlideImage(slide) {
  if (!slide?.image) return undefined;
  const image = new window.Image();
  image.src = slide.image;
  return image;
}

export default function PresentationPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isOverviewOpen, setIsOverviewOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement));
  const [controlsHidden, setControlsHidden] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const touchStartX = useRef(null);
  const inactivityTimer = useRef(null);

  const totalSlides = slides.length;
  const currentSlide = slides[currentIndex];

  useEffect(() => {
    const previousTitle = document.title;
    const descriptionMeta = document.querySelector('meta[name="description"]');
    const previousDescription = descriptionMeta?.getAttribute("content") || "";

    document.title = presentationTitle;
    descriptionMeta?.setAttribute("content", presentationDescription);

    return () => {
      document.title = previousTitle;
      descriptionMeta?.setAttribute("content", previousDescription);
    };
  }, []);

  const goToSlide = useCallback((nextIndex) => {
    setCurrentIndex((previousIndex) => {
      const clampedIndex = Math.max(0, Math.min(totalSlides - 1, nextIndex));
      if (clampedIndex === previousIndex) return previousIndex;
      setDirection(clampedIndex > previousIndex ? 1 : -1);
      return clampedIndex;
    });
  }, [totalSlides]);

  const goNext = useCallback(() => goToSlide(currentIndex + 1), [currentIndex, goToSlide]);
  const goPrevious = useCallback(() => goToSlide(currentIndex - 1), [currentIndex, goToSlide]);
  const goFirst = useCallback(() => goToSlide(0), [goToSlide]);
  const goLast = useCallback(() => goToSlide(totalSlides - 1), [goToSlide, totalSlides]);

  const showControlsTemporarily = useCallback(() => {
    setControlsHidden(false);
    window.clearTimeout(inactivityTimer.current);
    if (document.fullscreenElement) {
      inactivityTimer.current = window.setTimeout(() => setControlsHidden(true), 2800);
    }
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      setStatusMessage("Fullscreen is unavailable in this browser.");
    }
  }, []);

  useEffect(() => {
    const nearbySlides = [slides[currentIndex - 1], slides[currentIndex], slides[currentIndex + 1]];
    const preloadedImages = nearbySlides.map(preloadSlideImage);
    return () => {
      preloadedImages.forEach((image) => {
        if (image) image.src = "";
      });
    };
  }, [currentIndex]);

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
      setControlsHidden(false);
      showControlsTemporarily();
    };

    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, [showControlsTemporarily]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (["input", "textarea", "select"].includes(activeTag)) return;

      const handledKeys = ["ArrowRight", "ArrowLeft", " ", "PageDown", "PageUp", "Home", "End", "Escape", "f", "F"];
      if (!handledKeys.includes(event.key)) return;

      event.preventDefault();

      if (event.key === "ArrowRight" || event.key === " " || event.key === "PageDown") goNext();
      if (event.key === "ArrowLeft" || event.key === "PageUp") goPrevious();
      if (event.key === "Home") goFirst();
      if (event.key === "End") goLast();
      if (event.key === "Escape") {
        if (isOverviewOpen) setIsOverviewOpen(false);
        else if (document.fullscreenElement) document.exitFullscreen();
      }
      if (event.key === "f" || event.key === "F") toggleFullscreen();
      showControlsTemporarily();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [goFirst, goLast, goNext, goPrevious, isOverviewOpen, showControlsTemporarily, toggleFullscreen]);

  useEffect(() => {
    const onPointerActivity = () => showControlsTemporarily();
    window.addEventListener("mousemove", onPointerActivity);
    window.addEventListener("pointerdown", onPointerActivity);
    return () => {
      window.removeEventListener("mousemove", onPointerActivity);
      window.removeEventListener("pointerdown", onPointerActivity);
      window.clearTimeout(inactivityTimer.current);
    };
  }, [showControlsTemporarily]);

  const announceText = useMemo(() => `Slide ${currentIndex + 1} of ${totalSlides}: ${currentSlide.title}`, [currentIndex, currentSlide.title, totalSlides]);

  return (
    <div className="presentation-root">
      <PresentationBackground />
      <PresentationControls
        isFullscreen={isFullscreen}
        downloadFiles={downloadFiles}
        controlsHidden={controlsHidden}
        onToggleFullscreen={toggleFullscreen}
      />
      <PresentationStage
        slide={currentSlide}
        direction={direction}
        onPointerDown={(event) => {
          touchStartX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (touchStartX.current === null) return;
          const distance = event.clientX - touchStartX.current;
          touchStartX.current = null;
          if (Math.abs(distance) < swipeThreshold) return;
          if (distance < 0) goNext();
          else goPrevious();
        }}
      />
      <SlideNavigation
        currentIndex={currentIndex}
        totalSlides={totalSlides}
        controlsHidden={controlsHidden}
        onPrevious={goPrevious}
        onNext={goNext}
        onOverview={() => setIsOverviewOpen(true)}
      />
      {isOverviewOpen && (
        <SlideOverview
          slides={slides}
          currentIndex={currentIndex}
          onSelect={(index) => {
            goToSlide(index);
            setIsOverviewOpen(false);
          }}
          onClose={() => setIsOverviewOpen(false)}
        />
      )}
      <p className="sr-only" aria-live="polite">{announceText}</p>
      {statusMessage && <div className="presentation-status" role="status">{statusMessage}</div>}
      <div className="orientation-note" role="status">
        <strong>Landscape works best</strong>
        <span>Rotate your phone for the full 1536 x 1024 presentation view.</span>
      </div>
    </div>
  );
}
