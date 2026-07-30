import { useEffect, useState } from "react";
import { createPlaceholderSvg, formatSlideNumber, svgToDataUrl } from "./imageUtils";

export function SlideRenderer({ slide, isThumbnail = false }) {
  const [imageState, setImageState] = useState(slide.image ? "loading" : "placeholder");

  useEffect(() => {
    setImageState(slide.image ? "loading" : "placeholder");
  }, [slide.id, slide.image]);

  const showConfiguredImage = Boolean(slide.image && imageState !== "error");
  const placeholderUrl = svgToDataUrl(createPlaceholderSvg(slide));

  return (
    <div className={`slide-renderer${isThumbnail ? " is-thumbnail" : ""}${showConfiguredImage ? " has-slide-image" : " has-placeholder"}`}>
      {showConfiguredImage ? (
        <>
          {imageState === "loading" && <div className="slide-loading">Loading slide...</div>}
          <img
            src={slide.image}
            alt={slide.alt}
            draggable="false"
            loading={isThumbnail ? "lazy" : "eager"}
            onLoad={() => setImageState("ready")}
            onError={() => setImageState("error")}
          />
        </>
      ) : (
        <img
          src={placeholderUrl}
          alt={`${slide.alt}. Placeholder for ${slide.suggestedPath}.`}
          draggable="false"
          loading={isThumbnail ? "lazy" : "eager"}
        />
      )}
      {!isThumbnail && imageState === "error" && (
        <div className="slide-fallback" role="status">
          <strong>Slide {formatSlideNumber(slide.id)} image could not be loaded.</strong>
          <span>Showing the placeholder export frame instead.</span>
        </div>
      )}
    </div>
  );
}
