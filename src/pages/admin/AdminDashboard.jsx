import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BedDouble, Building2, Eye, Plus, RefreshCw } from "lucide-react";

import { getAllAccommodations } from "../../api/accommodations";
import { formatLKR } from "../../utils/format";
import { getUser } from "../../utils/auth";

function Stat({ icon: Icon, label, value, tone }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-extrabold text-ink">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}

export default function AdminDashboard() {
  const user = getUser();
  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getAllAccommodations()
      .then((data) => {
        if (!cancelled) setState({ loading: false, items: data.accommodations || [], error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            loading: false,
            items: [],
            error: err.response?.data?.message || "Could not load dashboard data",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const { loading, items, error } = state;
  const retry = () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    setReloadKey((k) => k + 1);
  };

  const visibleCount = items.filter((a) => a.isAvailable).length;
  const totalRooms = items.reduce((sum, a) => sum + (a.totalRooms || 0), 0);
  const freeRooms = items.reduce((sum, a) => sum + (a.availableRooms || 0), 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">
            Hello, {user?.firstName || "Admin"}
          </h1>
          <p className="mt-1 text-sm text-muted">Here is what is happening on UniNest.</p>
        </div>
        <Link
          to="/admin/accommodations/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30"
        >
          <Plus size={18} /> Add accommodation
        </Link>
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
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Stat icon={Building2} label="Total listings" value={loading ? "–" : items.length} tone="bg-primary-50 text-primary-600" />
            <Stat icon={Eye} label="Visible to students" value={loading ? "–" : visibleCount} tone="bg-success/10 text-success" />
            <Stat icon={BedDouble} label="Total rooms" value={loading ? "–" : totalRooms} tone="bg-accent-50 text-accent-600" />
            <Stat icon={BedDouble} label="Rooms available" value={loading ? "–" : freeRooms} tone="bg-warning/10 text-warning" />
          </div>

          <div className="rounded-2xl border border-border bg-white">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-extrabold text-ink">Recently added</h2>
              <Link to="/admin/accommodations" className="text-sm font-bold text-primary-600">
                Manage all
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3 p-5">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-10 animate-pulse rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : items.length === 0 ? (
              <p className="p-8 text-center text-sm text-muted">
                No accommodations yet. Add your first one!
              </p>
            ) : (
              <ul className="divide-y divide-border">
                {items.slice(0, 5).map((a) => (
                  <li key={a._id}>
                    <Link
                      to={`/admin/accommodations/${a._id}/edit`}
                      className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-primary-50/50"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">{a.title}</p>
                        <p className="text-xs text-muted">
                          {a.type} · {a.location?.city}
                        </p>
                      </div>
                      <p className="shrink-0 text-sm font-bold text-primary-600">
                        {formatLKR(a.monthlyRent)}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}