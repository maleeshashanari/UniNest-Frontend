import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({ value = 0, onChange, size = 18 }) {
  const [hover, setHover] = useState(0);
  const interactive = typeof onChange === "function";
  const shown = interactive && hover ? hover : value;

  return (
    <div
      className="inline-flex items-center gap-0.5"
      onMouseLeave={() => setHover(0)}
      role={interactive ? "radiogroup" : "img"}
      aria-label={`${value} out of 5 stars`}
    >
      {[1, 2, 3, 4, 5].map((n) => {
        const filled = n <= Math.round(shown);
        const star = (
          <Star
            size={size}
            className={filled ? "fill-warning text-warning" : "text-slate-300"}
          />
        );

        return interactive ? (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            onMouseEnter={() => setHover(n)}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            className="rounded p-0.5 transition-transform hover:scale-110"
          >
            {star}
          </button>
        ) : (
          <span key={n}>{star}</span>
        );
      })}
    </div>
  );
}