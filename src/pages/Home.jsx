import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { KeyRound, LogOut } from "lucide-react";

export default function Home() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-3xl border border-border bg-white p-8 text-center shadow-xl"
      >
        {user?.image && (
          <img
            src={user.image}
            alt="Profile"
            referrerPolicy="no-referrer"
            className="mx-auto mb-4 h-20 w-20 rounded-full border-4 border-primary-100 object-cover"
          />
        )}
        <h1 className="text-2xl font-extrabold text-ink">
          Welcome{user ? `, ${user.firstName}` : ""}!
        </h1>
        <p className="mt-1 text-sm text-muted">{user?.email}</p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to="/change-password"
            className="flex items-center justify-center gap-2 rounded-xl bg-primary-50 px-4 py-3 text-sm font-bold text-primary-700 transition-colors hover:bg-primary-100"
          >
            <KeyRound size={18} /> Change password
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent-50 px-4 py-3 text-sm font-bold text-accent-600 transition-colors hover:bg-accent-100"
          >
            <LogOut size={18} /> Log out
          </button>
        </div>
      </motion.div>
    </div>
  );
}