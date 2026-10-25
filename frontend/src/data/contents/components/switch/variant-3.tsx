import { useState } from "react";
import { motion } from "motion/react";

export default function Switch3() {
  const [enabled, setEnabled] = useState(true);

  return (
    <div
      onClick={() => setEnabled(!enabled)}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors border ${
        enabled ? "bg-primary/20 border-primary" : "bg-white/5 border-white/20"
      }`}
    >
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`w-4 h-4 rounded-full shadow-md ${
          enabled ? "bg-primary ml-auto" : "bg-white/60 mr-auto"
        }`}
      />
    </div>
  );
}
