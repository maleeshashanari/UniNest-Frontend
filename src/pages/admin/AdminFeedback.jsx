import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Loader2,
  MessageSquare,
  Pencil,
  RefreshCw,
  Reply,
  Search,
  Trash2,
} from "lucide-react";

import {
  adminDeleteFeedback,
  adminReplyFeedback,
  adminUpdateFeedback,
  getAllFeedback,
} from "../../api/feedback";
import Modal from "../../components/Modal";
import ReviewCard from "../../components/ReviewCard";
import ReviewForm from "../../components/ReviewForm";
import SelectInput from "../../components/SelectInput";

export default function AdminFeedback() {
  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [search, setSearch] = useState("");
  const [stars, setStars] = useState("All");
  const [sort, setSort] = useState("newest");
  const [unrepliedOnly, setUnrepliedOnly] = useState(false);
  const [modal, setModal] = useState(null); // { type: "reply" | "edit" | "delete", review }
  const [reply, setReply] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllFeedback()
      .then((data) => {
        if (!cancelled) setState({ loading: false, items: data.feedbacks || [], error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            loading: false,
            items: [],
            error: err.response?.data?.message || "Could not load feedback",
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

  // Responses are not populated, so keep the accommodation we already have
  const patchItem = (id, feedback) =>
    setState((s) => ({
      ...s,
      items: s.items.map((f) =>
        f._id === id ? { ...f, ...feedback, accommodation: f.accommodation } : f
      ),
    }));

  const summary = useMemo(() => {
    const total = items.length;
    const avg = total ? items.reduce((s, f) => s + f.rating, 0) / total : 0;
    const waiting = items.filter((f) => !f.adminReply).length;
    return { total, avg, waiting };
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

    const list = items.filter((f) => {
      if (stars !== "All" && f.rating !== Number(stars)) return false;
      if (unrepliedOnly && f.adminReply) return false;
      if (!q) return true;
      return [f.studentName, f.studentEmail, f.university, f.comment, f.accommodation?.title]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });

    if (sort === "highest") return [...list].sort((a, b) => b.rating - a.rating || byDate(a, b));
    if (sort === "lowest") return [...list].sort((a, b) => a.rating - b.rating || byDate(a, b));
    return [...list].sort(byDate);
  }, [items, search, stars, sort, unrepliedOnly]);

  const openReply = (review) => {
    setReply(review.adminReply || "");
    setModal({ type: "reply", review });
  };

  const sendReply = async () => {
    const text = reply.trim();
    if (!text) return toast.error("Write a reply first");
    if (text.length > 1000) return toast.error("Reply must not exceed 1000 characters");

    const target = modal.review;
    try {
      setSaving(true);
      const data = await adminReplyFeedback(target._id, text);
      patchItem(target._id, data.feedback);
      toast.success("Reply saved");
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save reply");
    } finally {
      setSaving(false);
    }
  };

  const saveEdit = async ({ rating, comment }) => {
    const target = modal.review;
    try {
      setSaving(true);
      const data = await adminUpdateFeedback(target._id, { rating, comment });
      patchItem(target._id, data.feedback);
      toast.success("Review updated");
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update review");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const target = modal.review;
    try {
      setSaving(true);
      await adminDeleteFeedback(target._id);
      setState((s) => ({ ...s, items: s.items.filter((f) => f._id !== target._id) }));
      toast.success("Review deleted");
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete review");
      setModal(null);
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
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Feedback</h1>
        <p className="mt-1 text-sm text-muted">
          {summary.waiting > 0
            ? `${summary.waiting} review${summary.waiting > 1 ? "s" : ""} waiting for a reply`
            : "Read, reply to and moderate student reviews."}
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total reviews", value: loading ? "–" : summary.total },
          { label: "Average rating", value: loading ? "–" : summary.avg.toFixed(1) },
          { label: "Awaiting reply", value: loading ? "–" : summary.waiting },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-white p-4 sm:p-5">
            <p className="text-2xl font-extrabold text-ink">{s.value}</p>
            <p className="text-xs text-muted sm:text-sm">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
        <div className="flex items-center rounded-xl border border-border bg-white focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15">
          <Search size={18} className="ml-3.5 shrink-0 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, university, accommodation or comment..."
            className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <SelectInput value={stars} onChange={(e) => setStars(e.target.value)}>
            <option value="All">All ratings</option>
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} {n === 1 ? "star" : "stars"}
              </option>
            ))}
          </SelectInput>
          <SelectInput value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="highest">Highest rated</option>
            <option value="lowest">Lowest rated</option>
          </SelectInput>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border px-3.5 py-3 text-sm font-semibold text-ink">
            Needs reply only
            <input
              type="checkbox"
              checked={unrepliedOnly}
              onChange={(e) => setUnrepliedOnly(e.target.checked)}
              className="h-4 w-4 accent-primary-600"
            />
          </label>
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
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-40 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <MessageSquare size={40} className="mx-auto text-primary-300" />
          <p className="mt-3 font-bold text-ink">
            {items.length === 0 ? "No reviews yet" : "No reviews match your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((f) => (
            <ReviewCard
              key={f._id}
              review={f}
              title={
                f.accommodation ? (
                  <Link
                    to={`/accommodations/${f.accommodation._id}`}
                    className="font-extrabold text-primary-600 hover:text-primary-700"
                  >
                    {f.accommodation.title}{" "}
                    <span className="text-xs font-medium text-muted">
                      ({f.accommodation.accommodationId})
                    </span>
                  </Link>
                ) : (
                  <span className="font-bold text-muted">Accommodation removed</span>
                )
              }
              actions={
                <>
                  <button
                    onClick={() => openReply(f)}
                    className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-bold text-white hover:bg-primary-700"
                  >
                    <Reply size={15} /> {f.adminReply ? "Edit reply" : "Reply"}
                  </button>
                  <button
                    onClick={() => setModal({ type: "edit", review: f })}
                    className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-sm font-bold text-primary-700 hover:bg-primary-100"
                  >
                    <Pencil size={15} /> Edit review
                  </button>
                  <button
                    onClick={() => setModal({ type: "delete", review: f })}
                    className="flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-2 text-sm font-bold text-accent-600 hover:bg-accent-100"
                  >
                    <Trash2 size={15} /> Delete
                  </button>
                </>
              }
            />
          ))}
        </div>
      )}

      {modal?.type === "reply" && (
        <Modal onClose={() => !saving && setModal(null)}>
          <h3 className="text-lg font-extrabold text-ink">
            Reply to {modal.review.studentName}
          </h3>
          <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            {modal.review.comment}
          </p>

          <label className="mb-1.5 mt-5 flex items-center justify-between text-sm font-semibold text-ink">
            <span>Your reply</span>
            <span className="text-[11px] font-medium text-muted">{reply.length}/1000</span>
          </label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={4}
            maxLength={1000}
            placeholder="Thank you for your feedback..."
            className="w-full rounded-xl border border-border bg-white px-3.5 py-3 text-sm outline-none placeholder:text-slate-400 hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
          />

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setModal(null)}
              disabled={saving}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={sendReply}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-70"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Save reply"}
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "edit" && (
        <Modal onClose={() => !saving && setModal(null)}>
          <h3 className="mb-1 text-lg font-extrabold text-ink">Edit review</h3>
          <p className="mb-4 text-sm text-muted">By {modal.review.studentName}</p>
          <ReviewForm
            initialRating={modal.review.rating}
            initialComment={modal.review.comment}
            submitLabel="Save changes"
            saving={saving}
            onSubmit={saveEdit}
            onCancel={() => setModal(null)}
          />
        </Modal>
      )}

      {modal?.type === "delete" && (
        <Modal onClose={() => !saving && setModal(null)} maxWidth="max-w-sm">
          <h3 className="text-lg font-extrabold text-ink">Delete this review?</h3>
          <p className="mt-1 text-sm text-muted">
            The review by <span className="font-bold text-ink">{modal.review.studentName}</span>{" "}
            will be permanently removed.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setModal(null)}
              disabled={saving}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600 disabled:opacity-70"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}