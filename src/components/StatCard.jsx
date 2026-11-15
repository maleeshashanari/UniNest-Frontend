import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import CountUp from "./CountUp";

export default function StatCard({ icon: Icon, label, value, tone, to, loading, hint }) {
  const body = (
    <>
      <div className="flex items-start justify-between">
        <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
          <Icon size={22} />
        </div>
        {to && (
          <ArrowUpRight
            size={18}
            className="text-slate-300 transition-colors group-hover:text-primary-600"
          />
        )}
      </div>

      <p className="mt-4 text-3xl font-extrabold tracking-tight text-ink">
        {loading ? (
          <span className="inline-block h-8 w-14 animate-pulse rounded-lg bg-slate-200" />
        ) : typeof value === "number" ? (
          <CountUp value={value} />
        ) : (
          value ?? "–"
        )}
      </p>
      <p className="mt-0.5 text-sm font-semibold text-muted">{label}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </>
  );

  const base = "group block rounded-3xl border border-border bg-white p-5 transition-all";

  return to ? (
    <Link
      to={to}
      className={`${base} hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/10`}
    >
      {body}
    </Link>
  ) : (
    <div className={base}>{body}</div>
  );
}