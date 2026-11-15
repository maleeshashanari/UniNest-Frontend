import { useState } from "react";
import { Loader2, Send } from "lucide-react";
import StarRating from "./StarRating";

const LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];

export default function ReviewForm({
  initialRating = 0,
  initialComment = "",
  submitLabel = "Submit review",
  saving = false,
  onSubmit,
  onCancel,
}) {
  const [rating, setRating] = useState(initialRating);
  const [comment, setComment] = useState(initialComment);
  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    const text = comment.trim();

    if (!rating) errs.rating = "Choose a star rating";
    if (text.length < 3) errs.comment = "Write at least 3 characters";
    else if (text.length > 1000) errs.comment = "Maximum 1000 characters";

    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ rating, comment: text });
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-ink">Your rating</label>
        <div className="flex items-center gap-3">
          <StarRating
            value={rating}
            size={28}
            onChange={(n) => {
              setRating(n);
              setErrors((p) => ({ ...p, rating: "" }));
            }}
          />
          {rating > 0 && <span className="text-sm font-bold text-warning">{LABELS[rating]}</span>}
        </div>
        {errors.rating && <p className="mt-1.5 text-xs font-medium text-danger">{errors.rating}</p>}
      </div>

      <div>
        <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-ink">
          <span>Your review</span>
          <span className="text-[11px] font-medium text-muted">{comment.length}/1000</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
            setErrors((p) => ({ ...p, comment: "" }));
          }}
          rows={4}
          maxLength={1000}
          placeholder="What was it like? Cleanliness, owner, safety, distance to campus..."
          className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink outline-none transition-all placeholder:text-slate-400 ${
            errors.comment
              ? "border-danger ring-4 ring-danger/10"
              : "border-border hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
          }`}
        />
        {errors.comment && (
          <p className="mt-1.5 text-xs font-medium text-danger">{errors.comment}</p>
        )}
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-70"
        >
          {saving ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <>
              <Send size={16} /> {submitLabel}
            </>
          )}
        </button>
      </div>
    </form>
  );
}