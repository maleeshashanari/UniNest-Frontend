import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Check, ChevronDown, PenLine, Search, X } from "lucide-react";
import { OTHERS, UNIVERSITIES } from "../data/universities";

export default function UniversitySelect({
  value,
  onChange,
  customValue,
  onCustomChange,
  error,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = UNIVERSITIES.filter((u) =>
    u.toLowerCase().includes(query.toLowerCase())
  );

  const choose = (val) => {
    onChange(val);
    setOpen(false);
    setQuery("");
  };

  return (
    <div>
      <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-ink">
        <span>University</span>
        <span className="rounded-full bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary-600">
          Optional
        </span>
      </label>

      <div ref={wrapRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`flex w-full items-center rounded-xl border bg-white/80 px-3.5 py-3 text-left text-sm transition-all duration-200 ${
            open
              ? "border-primary-500 ring-4 ring-primary-500/15"
              : "border-border hover:border-primary-300"
          }`}
        >
          <Building2 size={18} className={open ? "text-primary-500" : "text-muted"} />
          <span className={`ml-3 flex-1 truncate ${value ? "text-ink" : "text-slate-400"}`}>
            {value || "Select your university"}
          </span>

          {value && (
            <span
              role="button"
              onClick={(e) => {
                e.stopPropagation();
                choose("");
                onCustomChange("");
              }}
              className="mr-2 rounded-full p-1 text-muted hover:bg-slate-100"
            >
              <X size={14} />
            </span>
          )}
          <motion.span animate={{ rotate: open ? 180 : 0 }}>
            <ChevronDown size={18} className="text-muted" />
          </motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute z-30 mt-2 w-full overflow-hidden rounded-xl border border-border bg-white shadow-2xl shadow-primary-900/10"
            >
              <div className="flex items-center border-b border-border px-3">
                <Search size={16} className="text-muted" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search university..."
                  className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
                />
              </div>

              <ul className="max-h-56 overflow-y-auto py-1">
                {filtered.map((uni) => (
                  <li key={uni}>
                    <button
                      type="button"
                      onClick={() => choose(uni)}
                      className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm text-ink transition-colors hover:bg-primary-50"
                    >
                      <span>{uni}</span>
                      {value === uni && <Check size={16} className="text-primary-600" />}
                    </button>
                  </li>
                ))}

                {filtered.length === 0 && (
                  <li className="px-3.5 py-3 text-sm text-muted">No match found</li>
                )}

                <li className="mt-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => choose(OTHERS)}
                    className="flex w-full items-center justify-between px-3.5 py-2.5 text-left text-sm font-semibold text-accent-600 transition-colors hover:bg-accent-50"
                  >
                    <span>Others (my university is not listed)</span>
                    {value === OTHERS && <Check size={16} />}
                  </button>
                </li>
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Custom university input: visible only when "Others" is selected */}
      <AnimatePresence>
        {value === OTHERS && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pt-3">
              <div
                className={`flex items-center rounded-xl border bg-accent-50/50 transition-all focus-within:ring-4 ${
                  error
                    ? "border-danger focus-within:ring-danger/10"
                    : "border-accent-300 focus-within:border-accent-500 focus-within:ring-accent-500/15"
                }`}
              >
                <PenLine size={18} className="ml-3.5 text-accent-500" />
                <input
                  value={customValue}
                  onChange={(e) => onCustomChange(e.target.value)}
                  placeholder="Type your university name"
                  className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
                />
              </div>
              {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}