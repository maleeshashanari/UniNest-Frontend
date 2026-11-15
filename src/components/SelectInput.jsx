import { ChevronDown } from "lucide-react";

export default function SelectInput({ label, icon: Icon, error, children, ...props }) {
  return (
    <div>
      {label && <label className="mb-1.5 block text-sm font-semibold text-ink">{label}</label>}
      <div
        className={`relative flex items-center rounded-xl border bg-white transition-all ${
          error
            ? "border-danger ring-4 ring-danger/10"
            : "border-border hover:border-primary-300 focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15"
        }`}
      >
        {Icon && <Icon size={18} className="ml-3.5 shrink-0 text-muted" />}
        <select
          {...props}
          className="w-full appearance-none bg-transparent px-3 py-3 pr-9 text-sm text-ink outline-none"
        >
          {children}
        </select>
        <ChevronDown size={16} className="pointer-events-none absolute right-3 text-muted" />
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-danger">{error}</p>}
    </div>
  );
}