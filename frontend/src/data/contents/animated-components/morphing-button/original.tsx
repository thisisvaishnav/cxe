import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export function MorphingButton({
  buttonText = "Notify Me",
  onSubmit,
}: {
  buttonText?: string;
  onSubmit?: () => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    onSubmit?.();
    setTimeout(() => {
      setSubmitted(false);
      setIsOpen(false);
      setEmail("");
    }, 2000);
  };

  return (
    <div className="flex items-center justify-center">
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.button
            key="button"
            layoutId="morph-box"
            onClick={() => setIsOpen(true)}
            className="px-6 py-2.5 rounded-lg bg-primary text-background font-mono text-xs font-bold uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all shadow-lg"
          >
            {buttonText}
          </motion.button>
        ) : (
          <motion.form
            key="form"
            layoutId="morph-box"
            onSubmit={handleSubmit}
            className="flex items-center gap-2 p-1.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-md"
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="px-4 py-2 font-mono text-xs text-primary font-bold"
              >
                Subscribed! ✓
              </motion.div>
            ) : (
              <>
                <input
                  type="email"
                  placeholder="name@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent px-3 py-1.5 text-xs text-white placeholder-white/40 outline-none font-mono w-40"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded bg-primary text-background text-xs font-mono font-bold hover:opacity-90 transition-opacity"
                >
                  Send
                </button>
              </>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
