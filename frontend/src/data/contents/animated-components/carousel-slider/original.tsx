import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export interface SlideItem {
  id: number;
  img: string;
}

export function CarouselSlider({ slides }: { slides: SlideItem[] }) {
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((c) => (c + 1) % slides.length);
  const prev = () => setCurrent((c) => (c - 1 + slides.length) % slides.length);

  return (
    <div className="relative w-full max-w-[280px] h-[180px] rounded-xl overflow-hidden border border-white/10 group">
      <AnimatePresence mode="wait">
        <motion.img
          key={slides[current]?.id || current}
          src={slides[current]?.img}
          alt={`Slide ${current + 1}`}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

      {/* Navigation Buttons */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-auto">
        <button
          type="button"
          onClick={prev}
          className="w-7 h-7 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/90 active:scale-90 text-xs"
        >
          ‹
        </button>
        <span className="font-mono text-[10px] text-white/80 bg-black/40 px-2 py-0.5 rounded-full border border-white/10">
          {current + 1} / {slides.length}
        </span>
        <button
          type="button"
          onClick={next}
          className="w-7 h-7 rounded-full bg-black/60 border border-white/20 text-white flex items-center justify-center hover:bg-black/90 active:scale-90 text-xs"
        >
          ›
        </button>
      </div>
    </div>
  );
}
