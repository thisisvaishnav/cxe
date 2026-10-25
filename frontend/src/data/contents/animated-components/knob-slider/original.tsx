import React, { useRef, useCallback } from "react";

export function KnobSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  size = 200,
}: {
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
  size?: number;
}) {
  const knobRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const calculateAngle = useCallback((clientX: number, clientY: number) => {
    if (!knobRef.current) return;
    const rect = knobRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let rad = Math.atan2(dy, dx);
    let deg = (rad * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    // Constrain 45 deg to 315 deg (270 deg range)
    const clampedDeg = Math.min(Math.max(deg, 45), 315);
    const percent = (clampedDeg - 45) / 270;
    const newVal = Math.round(min + percent * (max - min));
    onChange(newVal);
  }, [min, max, onChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    isDragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    calculateAngle(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging.current) return;
    calculateAngle(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    isDragging.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const percent = (value - min) / (max - min);
  const angle = 45 + percent * 270;

  return (
    <div
      ref={knobRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ width: size, height: size }}
      className="relative flex items-center justify-center cursor-grab active:cursor-grabbing select-none"
    >
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.38}
          fill="none"
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth="6"
          strokeDasharray={`${size * 0.38 * 2 * Math.PI * 0.75} ${size * 0.38 * 2 * Math.PI * 0.25}`}
          strokeDashoffset={-size * 0.38 * 2 * Math.PI * 0.125}
          strokeLinecap="round"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.38}
          fill="none"
          stroke="currentColor"
          className="text-primary"
          strokeWidth="6"
          strokeDasharray={`${size * 0.38 * 2 * Math.PI * 0.75 * percent} ${size * 0.38 * 2 * Math.PI}`}
          strokeDashoffset={-size * 0.38 * 2 * Math.PI * 0.125}
          strokeLinecap="round"
        />
      </svg>

      <div
        className="absolute w-2/3 h-2/3 rounded-full bg-white/5 border border-white/20 flex flex-col items-center justify-center backdrop-blur-md shadow-2xl transition-transform"
        style={{ transform: `rotate(${angle - 180}deg)` }}
      >
        <div className="w-1.5 h-4 bg-primary rounded-full mb-auto mt-2" />
      </div>

      <div className="absolute flex flex-col items-center justify-center pointer-events-none">
        <span className="font-mono text-2xl font-bold text-white tracking-wider">
          {value}
        </span>
        <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest">
          LEVEL
        </span>
      </div>
    </div>
  );
}
