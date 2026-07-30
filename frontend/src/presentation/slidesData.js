export const suggestedSlideDirectory = "/presentation/slides";

const slideImages = {
  1: `${suggestedSlideDirectory}/slide-01.png`,
  2: `${suggestedSlideDirectory}/slide-02.png`,
  3: `${suggestedSlideDirectory}/slide-03-fit.png`,
  4: `${suggestedSlideDirectory}/slide-04-fit.png`,
  5: `${suggestedSlideDirectory}/slide-05-full.png`,
  6: `${suggestedSlideDirectory}/slide-06.png`,
  7: `${suggestedSlideDirectory}/slide-07-fit.png`,
  8: `${suggestedSlideDirectory}/slide-08.png`,
  9: `${suggestedSlideDirectory}/slide-09.png`,
  10: `${suggestedSlideDirectory}/slide-10.png`,
  11: `${suggestedSlideDirectory}/slide-11.png`,
  12: `${suggestedSlideDirectory}/slide-12-next-chapter.png`,
  13: `${suggestedSlideDirectory}/slide-13.png`,
  14: `${suggestedSlideDirectory}/slide-12.png`,
  15: `${suggestedSlideDirectory}/slide-15.png`
};

export const slides = Array.from({ length: 15 }, (_, index) => {
  const slideNumber = index + 1;
  const padded = String(slideNumber).padStart(2, "0");

  return {
    id: slideNumber,
    title: `Slide ${slideNumber}`,
    image: slideImages[slideNumber] || null,
    suggestedPath: `${suggestedSlideDirectory}/slide-${padded}.webp`,
    alt: `RozgaarAI presentation slide ${slideNumber}`
  };
});

export const deckTitle = "RozgaarAI Pitch Deck";
export const exportBaseName = "RozgaarAI-Presentation";
export const downloadFiles = {
  pdf: "/downloads/RozgaarAI-Presentation.pdf",
  pptx: "/downloads/RozgaarAI-Presentation.pptx"
};
