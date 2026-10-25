import { useState } from "react";
import { motion } from "motion/react";

export default function Tabs7() {
  const tabs = ["Overview", "Analytics", "Settings"];
  const [active, setActive] = useState(tabs[0]);

  return (
    <div className="flex items-center gap-1 p-1 bg-white/5 border border-white/10 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => setActive(tab)}
          className={`relative px-4 py-1.5 text-xs font-mono transition-colors ${
            active === tab ? "text-primary font-bold" : "text-white/60 hover:text-white"
          }`}
        >
          {active === tab && (
            <motion.div
              layoutId="tab7-active"
              className="absolute inset-0 bg-white/10 border border-white/20 rounded-md"
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tab}</span>
        </button>
      ))}
    </div>
  );
}
