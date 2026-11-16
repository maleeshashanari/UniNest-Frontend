import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Building2,
  CalendarCheck,
  ChevronDown,
  Home,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Mail,
  ShieldCheck,
  Star,
  UserRound,
} from "lucide-react";

import Avatar from "./Avatar";
import { clearSession, getUser } from "../utils/auth";

const links = [
  { to: "/home", label: "Dashboard", short: "Home", Icon: LayoutDashboard, end: true },
  { to: "/accommodations", label: "Find a stay", short: "Stays", Icon: Building2 },
  { to: "/my-bookings", label: "Bookings", short: "Bookings", Icon: CalendarCheck, studentOnly: true },
  { to: "/my-reviews", label: "Reviews", short: "Reviews", Icon: Star, studentOnly: true },
  // guestOk = guests can open the page (they get a "register first" popup when they act)
  { to: "/contact", label: "Contact", short: "Contact", Icon: Mail, studentOnly: true, guestOk: true },
];

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();
  const itemClass =
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink transition-colors hover:bg-primary-50 hover:text-primary-700";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-border bg-white p-1 pr-2.5 transition-colors hover:border-primary-300"
      >
        <Avatar src={user?.image} name={fullName} size={34} />
        <span className="hidden max-w-[110px] truncate text-sm font-bold text-ink sm:block">
          {user?.firstName}
        </span>
        <ChevronDown
          size={16}
          className={`text-muted transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 origin-top-right overflow-hidden rounded-2xl border border-border bg-white shadow-xl shadow-primary-900/10"
          >
            <div className="flex items-center gap-3 border-b border-border bg-slate-50 p-4">
              <Avatar src={user?.image} name={fullName} size={44} />
              <div className="min-w-0">
                <p className="truncate font-extrabold text-ink">{fullName || "Your account"}</p>
                <p className="truncate text-xs text-muted">{user?.email}</p>
              </div>
            </div>

            <div className="p-2">
              <Link to="/profile" onClick={() => setOpen(false)} className={itemClass}>
                <UserRound size={18} className="text-muted" /> My profile
              </Link>
              <Link to="/change-password" onClick={() => setOpen(false)} className={itemClass}>
                <KeyRound size={18} className="text-muted" /> Change password
              </Link>
              {user?.role === "admin" && (
                <Link to="/admin" onClick={() => setOpen(false)} className={itemClass}>
                  <ShieldCheck size={18} className="text-accent-600" /> Admin panel
                </Link>
              )}
              <button
                onClick={() => {
                  setOpen(false);
                  onLogout();
                }}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-accent-600 transition-colors hover:bg-accent-50"
              >
                <LogOut size={18} /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

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
    navigate("/home", { replace: true });
  };

  const guest = !user;
  const visible = links.filter(
    (l) => !l.studentOnly || user?.role === "student" || (guest && l.guestOk)
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Top navbar */}
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
          <Link to="/home" className="flex items-center gap-2.5 text-xl font-extrabold text-ink">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-accent-500 text-white shadow-md shadow-primary-500/30">
              <Home size={21} />
            </span>
            UniNest
          </Link>

          {/* Desktop links */}
          <nav className="hidden items-center gap-1 md:flex">
            {visible.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `relative flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-colors ${
                    isActive ? "text-primary-700" : "text-muted hover:text-ink"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-pill"
                        transition={{ type: "spring", stiffness: 500, damping: 38 }}
                        className="absolute inset-0 rounded-xl bg-primary-50"
                      />
                    )}
                    <Icon size={18} className="relative" />
                    <span className="relative">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {guest ? (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 text-sm font-bold text-ink transition-colors hover:bg-slate-100"
              >
                Sign in
              </Link>
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-primary-500/25 transition-transform hover:-translate-y-0.5"
              >
                Register
              </Link>
            </div>
          ) : (
            <ProfileMenu user={user} onLogout={logout} />
          )}
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-28 sm:py-8 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] md:hidden">
        <div
          className="mx-auto grid max-w-md"
          style={{ gridTemplateColumns: `repeat(${visible.length}, minmax(0, 1fr))` }}
        >
          {visible.map(({ to, short, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `relative flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-bold transition-colors ${
                  isActive ? "text-primary-600" : "text-muted"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <motion.span
                      layoutId="tab-pill"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                      className="absolute top-0 h-0.5 w-8 rounded-full bg-primary-600"
                    />
                  )}
                  <Icon size={21} />
                  {short}
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}