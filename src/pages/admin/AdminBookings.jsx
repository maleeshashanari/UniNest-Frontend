import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  BedDouble,
  CalendarDays,
  CalendarX2,
  GraduationCap,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";

import { getAllBookings, updateBookingStatus } from "../../api/bookings";
import StatusBadge from "../../components/StatusBadge";
import { ADMIN_ACTIONS, BOOKING_STATUSES } from "../../data/bookingOptions";
import { formatDate, formatLKR } from "../../utils/format";

export default function AdminBookings() {
  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [action, setAction] = useState(null); // { booking, to, label, hint }
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllBookings()
      .then((data) => {
        if (!cancelled) setState({ loading: false, items: data.bookings || [], error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            loading: false,
            items: [],
            error: err.response?.data?.message || "Could not load bookings",
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

  const counts = useMemo(() => {
    const c = { All: items.length };
    BOOKING_STATUSES.forEach((s) => (c[s] = items.filter((b) => b.status === s).length));
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((b) => {
      if (tab !== "All" && b.status !== tab) return false;
      if (!q) return true;
      return [b.studentName, b.studentEmail, b.studentPhone, b.university, b.accommodation?.title]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, tab, search]);

  const openAction = (booking, a) => {
    setAction({ booking, ...a });
    setNote(booking.adminNote || "");
  };

  const submitAction = async () => {
    if (note.trim().length > 500) {
      toast.error("Note must not exceed 500 characters");
      return;
    }

    const target = action.booking;
    try {
      setSaving(true);
      const data = await updateBookingStatus(target._id, {
        status: action.to,
        adminNote: note.trim(),
      });
      // The response is not populated, so keep the student and accommodation details we already have
      setState((s) => ({
        ...s,
        items: s.items.map((b) =>
          b._id === target._id
            ? { ...b, ...data.booking, accommodation: b.accommodation, student: b.student }
            : b
        ),
      }));
      toast.success(`Booking marked as ${action.to.toLowerCase()}`);
      setAction(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update booking");
      setAction(null);
      if (err.response?.status === 409 || err.response?.status === 400) retry(); // refresh stale data
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Bookings</h1>
        <p className="mt-1 text-sm text-muted">
          {counts.Pending > 0
            ? `${counts.Pending} request${counts.Pending > 1 ? "s" : ""} waiting for your decision`
            : "Manage student booking requests."}
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...BOOKING_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === s
                ? "bg-primary-600 text-white"
                : "bg-white text-muted hover:bg-primary-50 hover:text-primary-700"
            }`}
          >
            {s} <span className="opacity-70">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="flex items-center rounded-xl border border-border bg-white focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15">
        <Search size={18} className="ml-3.5 shrink-0 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by student, email, phone, university or accommodation..."
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
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <CalendarX2 size={40} className="mx-auto text-primary-300" />
          <p className="mt-3 font-bold text-ink">No bookings found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((b) => {
            const acc = b.accommodation;
            const actions = ADMIN_ACTIONS[b.status] || [];
            return (
              <div key={b._id} className="rounded-2xl border border-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-ink">{b.studentName}</h3>
                    <p className="text-sm text-muted">
                      Requested {formatDate(b.createdAt)} for{" "}
                      {acc ? (
                        <Link
                          to={`/accommodations/${acc._id}`}
                          className="font-bold text-primary-600 hover:text-primary-700"
                        >
                          {acc.title}
                        </Link>
                      ) : (
                        <span className="font-bold">a removed listing</span>
                      )}
                      {acc && <span> · {formatLKR(acc.monthlyRent)}/month</span>}
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>

                <div className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                  <a
                    href={`mailto:${b.studentEmail}`}
                    className="flex items-center gap-2 truncate text-ink hover:text-primary-600"
                  >
                    <Mail size={15} className="shrink-0 text-muted" /> {b.studentEmail}
                  </a>
                  <a
                    href={`tel:${(b.studentPhone || "").replace(/\s/g, "")}`}
                    className="flex items-center gap-2 text-ink hover:text-primary-600"
                  >
                    <Phone size={15} className="shrink-0 text-muted" /> {b.studentPhone}
                  </a>
                  <p className="flex items-center gap-2 truncate text-ink">
                    <GraduationCap size={15} className="shrink-0 text-muted" />
                    {b.university || "University not provided"}
                  </p>
                  <p className="flex items-center gap-2 text-ink">
                    <CalendarDays size={15} className="shrink-0 text-muted" /> Move-in{" "}
                    {formatDate(b.moveInDate)}
                  </p>
                  <p className="flex items-center gap-2 text-ink">
                    <BedDouble size={15} className="shrink-0 text-muted" /> {b.numberOfRooms}{" "}
                    {b.numberOfRooms === 1 ? "room" : "rooms"}
                  </p>
                  <p className="flex items-center gap-2 text-ink">
                    <Users size={15} className="shrink-0 text-muted" /> {b.numberOfStudents}{" "}
                    {b.numberOfStudents === 1 ? "student" : "students"}
                  </p>
                </div>

                {b.message && (
                  <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
                    <span className="font-bold text-ink">Student message: </span>
                    {b.message}
                  </p>
                )}
                {b.adminNote && (
                  <p className="mt-2 rounded-xl bg-primary-50 p-3 text-sm text-slate-600">
                    <span className="font-bold text-ink">Your note: </span>
                    {b.adminNote}
                  </p>
                )}
                {b.completedAt && (
                  <p className="mt-2 text-xs text-muted">Left on {formatDate(b.completedAt)}</p>
                )}

                {actions.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    {actions.map((a) => (
                      <button
                        key={a.to}
                        onClick={() => openAction(b, a)}
                        className={`rounded-lg px-4 py-2 text-sm font-bold transition-colors ${a.tone}`}
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Status change dialog */}
      <AnimatePresence>
        {action && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && setAction(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h3 className="text-lg font-extrabold text-ink">
                {action.label}: {action.booking.studentName}
              </h3>
              <p className="mt-1 text-sm text-muted">{action.hint}</p>

              <label className="mb-1.5 mt-5 flex items-center justify-between text-sm font-semibold text-ink">
                <span>Note to student (optional)</span>
                <span className="text-[11px] font-medium text-muted">{note.length}/500</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                maxLength={500}
                placeholder="e.g. Please bring your ID on move-in day"
                className="w-full rounded-xl border border-border bg-white px-3.5 py-3 text-sm outline-none placeholder:text-slate-400 hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
              />

              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => setAction(null)}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  onClick={submitAction}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-70"
                >
                  {saving ? <Loader2 size={16} className="animate-spin" /> : action.label}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}