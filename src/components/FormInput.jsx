import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function FormInput({
  icon: Icon,
  label,
  optional,
  error,
  right,
  type = "text",
  ...props
}) {
  const [focused, setFocused] = useState(false);

  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-ink">
        <span>{label}</span>
        {optional && (
          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-600">
            Optional
          </span>
        )}
      </label>

      <motion.div
        animate={error ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className={`relative flex items-center rounded-xl border bg-white/80 transition-all duration-200 ${
          error
            ? "border-danger ring-4 ring-danger/10"
            : focused
            ? "border-primary-500 ring-4 ring-primary-500/15"
            : "border-border hover:border-primary-300"
        }`}
      >
        {Icon && (
          <Icon
            size={18}
            className={`ml-3.5 shrink-0 transition-colors ${
              focused ? "text-primary-500" : "text-muted"
            }`}
          />
        )}
        <input
          type={type}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full bg-transparent px-3 py-3 text-sm text-ink outline-none placeholder:text-slate-400"
          {...props}
        />
        {right && <div className="mr-3">{right}</div>}
      </motion.div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-1.5 text-xs font-medium text-danger"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}