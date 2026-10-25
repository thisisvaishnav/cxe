import React from "react";

export default function Breadcrumb7() {
  const items = ["Terminal", "Markets", "BTC-USD"];

  return (
    <nav className="flex items-center space-x-2 font-mono text-xs">
      {items.map((item, idx) => (
        <React.Fragment key={item}>
          {idx > 0 && <span className="text-white/30">/</span>}
          <span
            className={
              idx === items.length - 1
                ? "text-primary font-bold"
                : "text-white/50 hover:text-white cursor-pointer transition-colors"
            }
          >
            {item}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}
