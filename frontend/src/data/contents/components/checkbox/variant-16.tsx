import { useState } from "react";
import { motion } from "motion/react";

export default function Checkbox16() {
  const [checked, setChecked] = useState(true);

  return (
    <label className="flex items-center gap-3 cursor-pointer select-none">
      <div
        onClick={() => setChecked(!checked)}
        className="w-5 h-5 rounded border border-white/20 bg-white/5 flex items-center justify-center transition-colors hover:border-primary/60"
      >
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-3 h-3 bg-primary rounded-sm flex items-center justify-center"
          >
            <svg
              className="w-2.5 h-2.5 text-black"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="4"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
        )}
      </div>
      <span className="font-mono text-xs text-white/80">Auto-execute limit orders</span>
    </label>
  );
}
