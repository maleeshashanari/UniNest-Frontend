import { Link, useLocation } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import Modal from "./Modal";

export default function LoginRequiredModal({ onClose, action = "do this" }) {
  const location = useLocation();

  return (
    <Modal onClose={onClose} maxWidth="max-w-sm">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
        <UserPlus size={22} />
      </div>
      <h3 className="text-lg font-extrabold text-ink">Create an account first</h3>
      <p className="mt-1 text-sm text-muted">
        You need a free UniNest account to {action}. It only takes a minute.
      </p>

      <div className="mt-6 space-y-3">
        <Link
          to="/register"
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-primary-500/30"
        >
          <UserPlus size={17} /> Register
        </Link>
        <Link
          to="/login"
          state={{ from: location }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-bold text-ink hover:bg-slate-50"
        >
          <LogIn size={17} /> I already have an account
        </Link>
        <button
          type="button"
          onClick={onClose}
          className="w-full py-1 text-sm font-bold text-muted hover:text-ink"
        >
          Keep browsing
        </button>
      </div>
    </Modal>
  );
}