import Avatar from "./Avatar";
import StarRating from "./StarRating";
import { formatDate } from "../utils/format";

export default function ReviewCard({ review, badge, title, actions, highlight = false }) {
  return (
    <div
      className={`rounded-2xl border p-5 ${
        highlight ? "border-primary-300 bg-primary-50/40" : "border-border bg-white"
      }`}
    >
      {title && <div className="mb-3 text-sm">{title}</div>}

      <div className="flex items-start gap-3">
        <Avatar name={review.studentName} size={40} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-extrabold text-ink">{review.studentName}</p>
            {badge && (
              <span className="rounded-full bg-primary-600 px-2 py-0.5 text-[11px] font-bold text-white">
                {badge}
              </span>
            )}
          </div>
          <p className="truncate text-xs text-muted">
            {review.university || "University not provided"} · {formatDate(review.createdAt)}
          </p>
        </div>
        <StarRating value={review.rating} size={16} />
      </div>

      <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
        {review.comment}
      </p>

      {review.adminReply && (
        <div className="mt-4 rounded-xl border-l-4 border-primary-500 bg-slate-50 p-3">
          <p className="text-xs font-bold text-primary-700">
            Reply from UniNest{review.repliedAt ? ` · ${formatDate(review.repliedAt)}` : ""}
          </p>
          <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{review.adminReply}</p>
        </div>
      )}

      {actions && <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">{actions}</div>}
    </div>
  );
}