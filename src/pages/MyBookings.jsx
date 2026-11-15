import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  BedDouble,
  Building2,
  CalendarDays,
  CalendarX2,
  Loader2,
  MapPin,
  RefreshCw,
  Users,
} from "lucide-react";

import { cancelMyBooking, getMyBookings } from "../api/bookings";
import StatusBadge from "../components/StatusBadge";
import { STATUS_HINTS } from "../data/bookingOptions";
import { coverImage, formatDate, formatLKR } from "../utils/format";

export default function MyBookings() {
  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyBookings()
      .then((data) => {
        if (!cancelled) setState({ loading: false, items: data.bookings || [], error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            loading: false,
            items: [],
            error: err.response?.data?.message || "Could not load your bookings",
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

  const confirmCancel = async () => {
    try {
      setCancelling(true);
      const data = await cancelMyBooking(toCancel._id);
      setState((s) => ({
        ...s,
        items: s.items.map((b) =>
          b._id === toCancel._id ? { ...b, status: data.booking.status } : b
        ),
      }));
      toast.success("Booking cancelled");
      setToCancel(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not cancel booking");
      setToCancel(null);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">My bookings</h1>
        <p className="mt-1 text-sm text-muted">Track your requests and stays.</p>
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
            <div key={n} className="h-40 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <CalendarX2 size={40} className="mx-auto text-primary-300" />
          <p className="mt-3 font-bold text-ink">No bookings yet</p>
          <Link
            to="/accommodations"
            className="mt-2 inline-block text-sm font-bold text-primary-600 hover:text-primary-700"
          >
            Find a stay
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((b) => {
            const acc = b.accommodation;
            const cover = coverImage(acc?.images);
            return (
              <div key={b._id} className="overflow-hidden rounded-2xl border border-border bg-white">
                <div className="flex gap-4 p-4 sm:p-5">
                  <div className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-primary-50">
                    {cover ? (
                      <img src={cover} alt="" loading="lazy" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-primary-300">
                        <Building2 size={28} />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      {acc ? (
                        <Link
                          to={`/accommodations/${acc._id}`}
                          className="truncate text-base font-extrabold text-ink hover:text-primary-600"
                        >
                          {acc.title}
                        </Link>
                      ) : (
                        <p className="font-extrabold text-muted">Accommodation removed</p>
                      )}
                      <StatusBadge status={b.status} />
                    </div>

                    {acc && (
                      <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
                        <MapPin size={14} className="shrink-0" />
                        {acc.location?.city} · {formatLKR(acc.monthlyRent)}/month
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs font-semibold text-ink">
                      <span className="flex items-center gap-1.5">
                        <CalendarDays size={14} className="text-muted" /> {formatDate(b.moveInDate)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <BedDouble size={14} className="text-muted" /> {b.numberOfRooms}{" "}
                        {b.numberOfRooms === 1 ? "room" : "rooms"}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={14} className="text-muted" /> {b.numberOfStudents}{" "}
                        {b.numberOfStudents === 1 ? "student" : "students"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border bg-slate-50 px-4 py-3 sm:px-5">
                  <div className="min-w-0 text-sm">
                    <p className="text-muted">{STATUS_HINTS[b.status]}</p>
                    {b.adminNote && (
                      <p className="mt-0.5 text-ink">
                        <span className="font-bold">Admin note:</span> {b.adminNote}
                      </p>
                    )}
                  </div>
                  {b.status === "Pending" && (
                    <button
                      onClick={() => setToCancel(b)}
                      className="shrink-0 rounded-lg bg-white px-4 py-2 text-sm font-bold text-accent-600 shadow-sm hover:bg-accent-50"
                    >
                      Cancel request
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AnimatePresence>
        {toCancel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !cancelling && setToCancel(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl"
            >
              <h3 className="text-lg font-extrabold text-ink">Cancel this request?</h3>
              <p className="mt-1 text-sm text-muted">
                Your booking for{" "}
                <span className="font-bold text-ink">{toCancel.accommodation?.title || "this stay"}</span>{" "}
                will be cancelled.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => setToCancel(null)}
                  disabled={cancelling}
                  className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
                >
                  Keep it
                </button>
                <button
                  onClick={confirmCancel}
                  disabled={cancelling}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600 disabled:opacity-70"
                >
                  {cancelling ? <Loader2 size={16} className="animate-spin" /> : "Yes, cancel"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}