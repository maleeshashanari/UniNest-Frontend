import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, MessageSquare, Pencil, RefreshCw, Trash2 } from "lucide-react";

import {
  addFeedback,
  deleteMyFeedback,
  getAccommodationFeedback,
  updateMyFeedback,
} from "../api/feedback";
import Modal from "./Modal";
import ReviewCard from "./ReviewCard";
import ReviewForm from "./ReviewForm";
import SelectInput from "./SelectInput";
import StarRating from "./StarRating";
import { getUser } from "../utils/auth";

export default function FeedbackSection({ accommodationId }) {
  const myId = getUser()?.id;

  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    let cancelled = false;
    getAccommodationFeedback(accommodationId)
      .then((data) => {
        if (!cancelled) setState({ loading: false, items: data.feedbacks || [], error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            loading: false,
            items: [],
            error: err.response?.data?.message || "Could not load reviews",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [accommodationId, reloadKey]);

  const { loading, items, error } = state;
  const mine = items.find((f) => String(f.student) === String(myId));

  const retry = () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    setReloadKey((k) => k + 1);
  };

  const stats = useMemo(() => {
    const total = items.length;
    const avg = total ? items.reduce((s, f) => s + f.rating, 0) / total : 0;
    const dist = [5, 4, 3, 2, 1].map((n) => ({
      n,
      count: items.filter((f) => f.rating === n).length,
    }));
    return { total, avg, dist };
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = items.filter((f) => !q || (f.university || "").toLowerCase().includes(q));
    const byDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

    if (sort === "highest") return [...list].sort((a, b) => b.rating - a.rating || byDate(a, b));
    if (sort === "lowest") return [...list].sort((a, b) => a.rating - b.rating || byDate(a, b));
    return [...list].sort(byDate);
  }, [items, search, sort]);

  const create = async ({ rating, comment }) => {
    try {
      setSaving(true);
      const data = await addFeedback({ accommodation: accommodationId, rating, comment });
      setState((s) => ({ ...s, items: [data.feedback, ...s.items] }));
      toast.success("Thanks for your review!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not submit review");
      if (err.response?.status === 409) retry();
    } finally {
      setSaving(false);
    }
  };

  const update = async ({ rating, comment }) => {
    try {
      setSaving(true);
      const data = await updateMyFeedback(mine._id, { rating, comment });
      setState((s) => ({
        ...s,
        items: s.items.map((f) => (f._id === mine._id ? data.feedback : f)),
      }));
      setEditing(false);
      toast.success("Review updated");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update review");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    try {
      setSaving(true);
      await deleteMyFeedback(mine._id);
      setState((s) => ({ ...s, items: s.items.filter((f) => f._id !== mine._id) }));
      setConfirmDelete(false);
      toast.success("Review deleted");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete review");
      setConfirmDelete(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-border bg-white p-6 sm:p-8">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
        <MessageSquare size={22} className="text-primary-600" /> Reviews
      </h2>

      {error ? (
        <div className="mt-4 rounded-2xl border border-danger/20 bg-danger/5 p-6 text-center">
          <p className="font-bold text-danger">{error}</p>
          <button
            onClick={retry}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm"
          >
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      ) : loading ? (
        <div className="mt-4 space-y-3">
          {[1, 2].map((n) => (
            <div key={n} className="h-28 animate-pulse rounded-2xl bg-slate-100" />
          ))}
        </div>
      ) : (
        <>
          {/* Summary */}
          {stats.total > 0 && (
            <div className="mt-5 grid gap-5 rounded-2xl bg-slate-50 p-5 sm:grid-cols-[auto_1fr] sm:items-center">
              <div className="text-center sm:px-4">
                <p className="text-4xl font-extrabold text-ink">{stats.avg.toFixed(1)}</p>
                <StarRating value={stats.avg} size={16} />
                <p className="mt-1 text-xs text-muted">
                  {stats.total} {stats.total === 1 ? "review" : "reviews"}
                </p>
              </div>
              <div className="space-y-1.5">
                {stats.dist.map(({ n, count }) => (
                  <div key={n} className="flex items-center gap-2 text-xs">
                    <span className="w-3 font-bold text-ink">{n}</span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="w-6 text-right text-muted">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Write / manage my review */}
          <div className="mt-6">
            {!mine ? (
              <div className="rounded-2xl border border-border p-5">
                <h3 className="mb-4 font-extrabold text-ink">Write a review</h3>
                <ReviewForm saving={saving} onSubmit={create} />
              </div>
            ) : editing ? (
              <div className="rounded-2xl border border-primary-300 p-5">
                <h3 className="mb-4 font-extrabold text-ink">Edit your review</h3>
                <ReviewForm
                  initialRating={mine.rating}
                  initialComment={mine.comment}
                  submitLabel="Save changes"
                  saving={saving}
                  onSubmit={update}
                  onCancel={() => setEditing(false)}
                />
              </div>
            ) : (
              <ReviewCard
                review={mine}
                badge="Your review"
                highlight
                actions={
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-bold text-primary-700 shadow-sm hover:bg-primary-50"
                    >
                      <Pencil size={15} /> Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(true)}
                      className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-sm font-bold text-accent-600 shadow-sm hover:bg-accent-50"
                    >
                      <Trash2 size={15} /> Delete
                    </button>
                  </>
                }
              />
            )}
          </div>

          {/* Other reviews */}
          {stats.total > 0 && (
            <>
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by reviewer's university"
                  className="w-full rounded-xl border border-border bg-white px-3.5 py-3 text-sm outline-none placeholder:text-slate-400 hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
                />
                <SelectInput value={sort} onChange={(e) => setSort(e.target.value)}>
                  <option value="newest">Newest first</option>
                  <option value="highest">Highest rated</option>
                  <option value="lowest">Lowest rated</option>
                </SelectInput>
              </div>

              <div className="mt-4 space-y-4">
                {visible.filter((f) => f._id !== mine?._id).map((f) => (
                  <ReviewCard key={f._id} review={f} />
                ))}
                {visible.filter((f) => f._id !== mine?._id).length === 0 && (
                  <p className="py-4 text-center text-sm text-muted">
                    {search ? "No reviews match this university." : "No other reviews yet."}
                  </p>
                )}
              </div>
            </>
          )}

          {stats.total === 0 && !mine && (
            <p className="mt-4 text-sm text-muted">No reviews yet. Be the first to share yours!</p>
          )}
        </>
      )}

      {confirmDelete && (
        <Modal onClose={() => !saving && setConfirmDelete(false)} maxWidth="max-w-sm">
          <h3 className="text-lg font-extrabold text-ink">Delete your review?</h3>
          <p className="mt-1 text-sm text-muted">This cannot be undone.</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setConfirmDelete(false)}
              disabled={saving}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
            >
              Keep it
            </button>
            <button
              onClick={remove}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600 disabled:opacity-70"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </section>
  );
}