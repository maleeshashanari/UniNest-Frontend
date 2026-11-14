import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { passwordRules } from "../data/passwordRules";

const colors = ["bg-slate-200", "bg-danger", "bg-accent-500", "bg-warning", "bg-primary-400", "bg-success"];

export default function PasswordStrength({ password }) {
  if (!password) return null;

  const passed = passwordRules.filter((r) => r.test(password)).length;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-2.5 overflow-hidden"
    >
      <div className="flex gap-1.5">
        {passwordRules.map((_, i) => (
          <motion.div
            key={i}
            animate={{ scaleX: i < passed ? 1 : 0.6, opacity: i < passed ? 1 : 0.5 }}
            className={`h-1.5 flex-1 origin-left rounded-full transition-colors ${
              i < passed ? colors[passed] : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
        {passwordRules.map((r) => {
          const ok = r.test(password);
          return (
            <span
              key={r.label}
              className={`flex items-center gap-1 text-[11px] font-medium transition-colors ${
                ok ? "text-success" : "text-muted"
              }`}
            >
              {ok ? <Check size={12} /> : <X size={12} />}
              {r.label}
            </span>
          );
        })}
      </div>
    </motion.div>
  );
}