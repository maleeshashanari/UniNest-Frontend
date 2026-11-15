import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import { Building2, Eye, Loader2, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";

import {
  deleteAccommodation,
  getAllAccommodations,
  updateAccommodation,
} from "../../api/accommodations";
import { coverImage, formatLKR } from "../../utils/format";

export default function AdminAccommodations() {
  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
            error: err.response?.data?.message || "Could not load accommodations",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const { loading, items, error } = state;
  const setItems = (updater) => setState((s) => ({ ...s, items: updater(s.items) }));

  const retry = () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    setReloadKey((k) => k + 1);
  };

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) =>
      [a.title, a.accommodationId, a.type, a.location?.city, a.university]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [items, search]);

  const toggleVisibility = async (item) => {
    try {
      setBusyId(item._id);
      const data = await updateAccommodation(item._id, { isAvailable: !item.isAvailable });
      setItems((list) => list.map((a) => (a._id === item._id ? data.accommodation : a)));
      toast.success(data.accommodation.isAvailable ? "Visible to students" : "Hidden from students");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update");
    } finally {
      setBusyId(null);
    }
  };

  const confirmDelete = async () => {
    try {
      setDeleting(true);
      await deleteAccommodation(toDelete._id);
      setItems((list) => list.filter((a) => a._id !== toDelete._id));
      toast.success("Accommodation deleted");
      setToDelete(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Accommodations</h1>
          <p className="mt-1 text-sm text-muted">{items.length} listings in total</p>
        </div>
        <Link
          to="/admin/accommodations/new"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30"
        >
          <Plus size={18} /> Add accommodation
        </Link>
      </div>

      <div className="flex items-center rounded-xl border border-border bg-white focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15">
        <Search size={18} className="ml-3.5 shrink-0 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title, ID, type, city..."
          className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
        />
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
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Building2 size={40} className="mx-auto text-primary-300" />
          <p className="mt-3 font-bold text-ink">
            {items.length === 0 ? "No accommodations yet" : "No results"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Accommodation</th>
                <th className="px-4 py-3 font-bold">Type</th>
                <th className="px-4 py-3 font-bold">City</th>
                <th className="px-4 py-3 font-bold">Rent</th>
                <th className="px-4 py-3 font-bold">Rooms</th>
                <th className="px-4 py-3 font-bold">Visible</th>
                <th className="px-4 py-3 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((a) => {
                const cover = coverImage(a.images);
                return (
                  <tr key={a._id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-primary-50">
                          {cover ? (
                            <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full items-center justify-center text-primary-300">
                              <Building2 size={20} />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">{a.title}</p>
                          <p className="text-xs text-muted">{a.accommodationId}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-ink">{a.type}</td>
                    <td className="px-4 py-3 text-ink">{a.location?.city}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{formatLKR(a.monthlyRent)}</td>
                    <td className="px-4 py-3 text-ink">
                      {a.availableRooms}/{a.totalRooms}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={a.isAvailable}
                        disabled={busyId === a._id || (!a.isAvailable && a.availableRooms === 0)}
                        title={
                          !a.isAvailable && a.availableRooms === 0
                            ? "No rooms available. Increase available rooms first."
                            : "Show or hide for students"
                        }
                        onClick={() => toggleVisibility(a)}
                        className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
                          a.isAvailable ? "bg-success" : "bg-slate-300"
                        }`}
                      >
                        <span
                          className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                            a.isAvailable ? "translate-x-5" : ""
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <Link
                          to={`/accommodations/${a._id}`}
                          title="View"
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-primary-50 hover:text-primary-600"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/admin/accommodations/${a._id}/edit`}
                          title="Edit"
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-primary-50 hover:text-primary-600"
                        >
                          <Pencil size={18} />
                        </Link>
                        <button
                          title="Delete"
                          onClick={() => setToDelete(a)}
                          className="rounded-lg p-2 text-muted transition-colors hover:bg-accent-50 hover:text-accent-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirmation */}
      <AnimatePresence>
        {toDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !deleting && setToDelete(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-accent-50 text-accent-600">
                <Trash2 size={22} />
              </div>
              <h3 className="text-lg font-extrabold text-ink">Delete this listing?</h3>
              <p className="mt-1 text-sm text-muted">
                <span className="font-bold text-ink">{toDelete.title}</span> will be permanently
                removed. This cannot be undone.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setToDelete(null)}
                  disabled={deleting}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600 disabled:opacity-70"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}