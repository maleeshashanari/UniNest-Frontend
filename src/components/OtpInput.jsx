import { useRef } from "react";
import { motion } from "framer-motion";

export default function OtpInput({ value, onChange, length = 5, error }) {
  const refs = useRef([]);
  const digits = Array.from({ length }, (_, i) => value[i] || "");

  const focusBox = (i) => refs.current[i]?.focus();

  const handleChange = (i, e) => {
    const typed = e.target.value.replace(/\D/g, "");
    const next = [...digits];

    if (!typed) {
      next[i] = "";
      onChange(next.join(""));
      return;
    }

    next[i] = typed.slice(-1);
    onChange(next.join(""));
    if (i < length - 1) focusBox(i + 1);
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      const next = [...digits];
      next[i - 1] = "";
      onChange(next.join(""));
      focusBox(i - 1);
    }
    if (e.key === "ArrowLeft" && i > 0) focusBox(i - 1);
    if (e.key === "ArrowRight" && i < length - 1) focusBox(i + 1);
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    focusBox(Math.min(pasted.length, length - 1));
  };

  return (
    <div>
      <motion.div
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex justify-between gap-2.5"
      >
        {digits.map((d, i) => (
          <motion.input
            key={i}
            ref={(el) => (refs.current[i] = el)}
            value={d}
            onChange={(e) => handleChange(i, e)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={1}
            whileFocus={{ scale: 1.08, y: -2 }}
            className={`h-14 w-full rounded-xl border bg-white/80 text-center text-xl font-extrabold text-ink outline-none transition-all ${
              error
                ? "border-danger ring-4 ring-danger/10"
                : d
                ? "border-primary-500 bg-primary-50"
                : "border-border focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
            }`}
          />
        ))}
      </motion.div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}