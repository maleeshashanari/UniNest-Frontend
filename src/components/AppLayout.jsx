import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, CalendarCheck, Home, KeyRound, LogOut, ShieldCheck, UserRound } from "lucide-react";

import Avatar from "./Avatar";
import { clearSession, getUser } from "../utils/auth";

const links = [
  { to: "/home", label: "Home", Icon: Home },
  { to: "/accommodations", label: "Stays", Icon: Building2 },
  { to: "/profile", label: "Profile", Icon: UserRound },
  { to: "/change-password", label: "Password", Icon: KeyRound },
  { to: "/my-bookings", label: "Bookings", Icon: CalendarCheck, studentOnly: true },
];

export default function AppLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(getUser);

  useEffect(() => {
    const refresh = () => setUser(getUser());
    window.addEventListener("auth-changed", refresh);
    return () => window.removeEventListener("auth-changed", refresh);
  }, []);

  const logout = () => {
    clearSession();
    toast.success("Logged out");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2 text-xl font-extrabold text-ink">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Home size={20} />
            </span>
            <span className="hidden sm:inline">UniNest</span>
          </div>

          <nav className="flex items-center gap-1">
            {links
              .filter((l) => !l.studentOnly || user?.role === "student")
              .map(({ to, label, Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-muted hover:bg-slate-100 hover:text-ink"
                  }`
                }
              >
                <Icon size={18} />
                <span className="hidden md:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-2 text-sm font-bold text-accent-600 transition-colors hover:bg-accent-100"
              >
                <ShieldCheck size={16} />
                <span className="hidden sm:inline">Admin panel</span>
              </Link>
            )}
            <Avatar
              src={user?.image}
              name={`${user?.firstName || ""} ${user?.lastName || ""}`}
              size={36}
            />
            <button
              onClick={logout}
              title="Log out"
              className="rounded-lg p-2 text-muted transition-colors hover:bg-accent-50 hover:text-accent-600"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}