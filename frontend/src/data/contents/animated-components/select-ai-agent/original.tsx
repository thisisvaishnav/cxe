import React, { useState } from "react";
import { motion } from "motion/react";

export interface AgentItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

export function SelectAIAgent({ agents }: { agents: AgentItem[] }) {
  const [selected, setSelected] = useState<string>(agents[0]?.id || "");

  return (
    <div className="flex items-center gap-2 p-1.5 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md">
      {agents.map((agent) => {
        const isSelected = selected === agent.id;
        return (
          <button
            key={agent.id}
            type="button"
            onClick={() => setSelected(agent.id)}
            className="relative px-4 py-2 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white"
          >
            {isSelected && (
              <motion.div
                layoutId="active-agent-pill"
                className="absolute inset-0 rounded-lg bg-white/10 border border-white/20 shadow-sm"
                transition={{ type: "spring", stiffness: 350, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center justify-center">
              {agent.icon}
            </span>
            <span className="relative z-10 font-mono text-xs">{agent.name}</span>
          </button>
        );
      })}
    </div>
  );
}
