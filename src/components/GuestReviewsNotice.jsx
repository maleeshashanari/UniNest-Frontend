import { Link, useLocation } from "react-router-dom";
import { MessageSquare } from "lucide-react";

export default function GuestReviewsNotice() {
  const location = useLocation();

  return (
    <section className="rounded-3xl border border-border bg-white p-6 sm:p-8">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-ink">
        <MessageSquare size={22} className="text-primary-600" /> Reviews
      </h2>

      <div className="mt-4 rounded-2xl bg-slate-50 p-6 text-center">
        <p className="font-extrabold text-ink">Register to read and write reviews</p>
        <p className="mt-1 text-sm text-muted">
          Reviews are shared by verified UniNest students. Create a free account to see them.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link
            to="/register"
            className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
          >
            Register
          </Link>
          <Link
            to="/login"
            state={{ from: location }}
            className="rounded-xl border border-border px-5 py-2.5 text-sm font-bold text-ink hover:bg-white"
          >
            Sign in
          </Link>
        </div>
      </div>
    </section>
  );
}