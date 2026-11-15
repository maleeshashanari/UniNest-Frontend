import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Loader2, MessageSquare, Pencil, RefreshCw, Trash2 } from "lucide-react";

import { deleteMyFeedback, getMyFeedback, updateMyFeedback } from "../api/feedback";
import Modal from "../components/Modal";
import ReviewCard from "../components/ReviewCard";
import ReviewForm from "../components/ReviewForm";

export default function MyFeedback() {
  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [modal, setModal] = useState(null); // { type: "edit" | "delete", review }
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getMyFeedback()
      .then((data) => {
        if (!cancelled) setState({ loading: false, items: data.feedbacks || [], error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            loading: false,
            items: [],
            error: err.response?.data?.message || "Could not load your reviews",
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

  const saveEdit = async ({ rating, comment }) => {
    const target = modal.review;
    try {
      setSaving(true);
      const data = await updateMyFeedback(target._id, { rating, comment });
      // Response is not populated, so keep the accommodation details we already have
      setState((s) => ({
        ...s,
        items: s.items.map((f) =>
          f._id === target._id ? { ...f, ...data.feedback, accommodation: f.accommodation } : f
        ),
      }));
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
      await deleteMyFeedback(target._id);
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
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">My reviews</h1>
        <p className="mt-1 text-sm text-muted">Reviews you have written for places.</p>
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
            <div key={n} className="h-36 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <MessageSquare size={40} className="mx-auto text-primary-300" />
          <p className="mt-3 font-bold text-ink">No reviews yet</p>
          <p className="mt-1 text-sm text-muted">Open any stay and share your experience.</p>
          <Link
            to="/accommodations"
            className="mt-3 inline-block text-sm font-bold text-primary-600 hover:text-primary-700"
          >
            Browse stays
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((f) => (
            <ReviewCard
              key={f._id}
              review={f}
              title={
                f.accommodation ? (
                  <Link
                    to={`/accommodations/${f.accommodation._id}`}
                    className="font-extrabold text-primary-600 hover:text-primary-700"
                  >
                    {f.accommodation.title}
                  </Link>
                ) : (
                  <span className="font-bold text-muted">Accommodation removed</span>
                )
              }
              actions={
                <>
                  <button
                    onClick={() => setModal({ type: "edit", review: f })}
                    className="flex items-center gap-1.5 rounded-lg bg-primary-50 px-3 py-2 text-sm font-bold text-primary-700 hover:bg-primary-100"
                  >
                    <Pencil size={15} /> Edit
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

      {modal?.type === "edit" && (
        <Modal onClose={() => !saving && setModal(null)}>
          <h3 className="mb-4 text-lg font-extrabold text-ink">Edit your review</h3>
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
          <p className="mt-1 text-sm text-muted">This cannot be undone.</p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setModal(null)}
              disabled={saving}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
            >
              Keep it
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