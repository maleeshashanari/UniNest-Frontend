import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Building2, RefreshCw, Search } from "lucide-react";

import { getPublicAccommodations } from "../api/accommodations";
import AccommodationCard from "../components/AccommodationCard";
import CardSkeleton from "../components/CardSkeleton";
import SelectInput from "../components/SelectInput";
import { SUITABLE_FOR, TYPES } from "../data/accommodationOptions";

const DEFAULT_FILTERS = { search: "", type: "", suitableFor: "", maxRent: "", sort: "newest" };

export default function Accommodations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  useEffect(() => {
    let cancelled = false;
    getPublicAccommodations()
      .then((data) => {
        if (cancelled) return;
        setItems(data.accommodations || []);
        setError("");
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.response?.data?.message || "Could not load accommodations");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  };

  const setFilter = (key, value) => setFilters((p) => ({ ...p, [key]: value }));

  const visible = useMemo(() => {
    const q = filters.search.trim().toLowerCase();
    const max = Number(filters.maxRent);

    const list = items.filter((a) => {
      if (q) {
        const haystack = [a.title, a.location?.address, a.location?.city, a.location?.district, a.university]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      if (filters.type && a.type !== filters.type) return false;
      if (filters.suitableFor && a.suitableFor !== filters.suitableFor && a.suitableFor !== "Any")
        return false;
      if (max && a.monthlyRent > max) return false;
      return true;
    });

    if (filters.sort === "low") return [...list].sort((a, b) => a.monthlyRent - b.monthlyRent);
    if (filters.sort === "high") return [...list].sort((a, b) => b.monthlyRent - a.monthlyRent);
    return list;
  }, [items, filters]);

  const hasFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Find your nest</h1>
        <p className="mt-1 text-sm text-muted">Verified stays near Sri Lankan universities.</p>
      </div>

      <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
        <div className="flex items-center rounded-xl border border-border bg-white focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15">
          <Search size={18} className="ml-3.5 shrink-0 text-muted" />
          <input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search by name, city, area or university..."
            className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SelectInput value={filters.type} onChange={(e) => setFilter("type", e.target.value)}>
            <option value="">All types</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </SelectInput>

          <SelectInput
            value={filters.suitableFor}
            onChange={(e) => setFilter("suitableFor", e.target.value)}
          >
            <option value="">Boys & Girls</option>
            {SUITABLE_FOR.filter((s) => s !== "Any").map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </SelectInput>

          <div className="flex items-center rounded-xl border border-border bg-white focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15">
            <span className="pl-3.5 text-sm font-semibold text-muted">Rs.</span>
            <input
              type="number"
              min="0"
              value={filters.maxRent}
              onChange={(e) => setFilter("maxRent", e.target.value)}
              placeholder="Max rent / month"
              className="w-full bg-transparent px-2 py-3 text-sm outline-none placeholder:text-slate-400"
            />
          </div>

          <SelectInput value={filters.sort} onChange={(e) => setFilter("sort", e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </SelectInput>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
          <p className="font-bold text-danger">{error}</p>
          <button
            onClick={retry}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm"
          >
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Building2 size={40} className="mx-auto text-primary-300" />
          <p className="mt-3 font-bold text-ink">No accommodations found</p>
          <p className="mt-1 text-sm text-muted">
            {items.length === 0 ? "Nothing has been listed yet." : "Try changing your filters."}
          </p>
          {hasFilters && (
            <button
              onClick={() => setFilters(DEFAULT_FILTERS)}
              className="mt-4 text-sm font-bold text-primary-600 hover:text-primary-700"
            >
              Clear filters
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm font-semibold text-muted">
            {visible.length} {visible.length === 1 ? "stay" : "stays"} found
          </p>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((item) => (
              <AccommodationCard key={item._id} item={item} />
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}