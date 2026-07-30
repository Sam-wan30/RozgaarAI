import { AnimatePresence, motion } from "framer-motion";
import { SlideRenderer } from "./SlideRenderer";

const slideVariants = {
  enter: (direction) => ({
    opacity: 0,
    x: direction > 0 ? 44 : -44,
    scale: 0.985
  }),
  center: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  exit: (direction) => ({
    opacity: 0,
    x: direction > 0 ? -44 : 44,
    scale: 0.985
  })
};

export function PresentationStage({ slide, direction, onPointerDown, onPointerUp }) {
  return (
    <main className="presentation-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp}>
      <div className="slide-shell">
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.article
            key={slide.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="slide-motion-layer"
            aria-label={slide.alt}
          >
            <div className="slide-viewport">
              <SlideRenderer slide={slide} />
            </div>
          </motion.article>
        </AnimatePresence>
      </div>
    </main>
  );
}
