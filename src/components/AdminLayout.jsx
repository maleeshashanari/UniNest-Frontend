import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Building2,
  CalendarCheck,
  ExternalLink,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquare,
  Plus,
  ShieldCheck,
  UserCog,
  Users,
  X,
} from "lucide-react";

import Avatar from "./Avatar";
import { clearSession, getUser } from "../utils/auth";

const groups = [
  {
    title: "Overview",
    items: [{ to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true }],
  },
  {
    title: "Manage",
    items: [
      { to: "/admin/accommodations", label: "Accommodations", Icon: Building2 },
      { to: "/admin/bookings", label: "Bookings", Icon: CalendarCheck },
      { to: "/admin/students", label: "Students", Icon: Users },
      { to: "/admin/roles", label: "Roles", Icon: UserCog },
    ],
  },
  {
    title: "Communication",
    items: [
      { to: "/admin/feedback", label: "Feedback", Icon: MessageSquare },
      { to: "/admin/contact", label: "Contact", Icon: Inbox },
    ],
  },
];

function titleFor(path) {
  if (path.startsWith("/admin/accommodations/new")) return "Add accommodation";
  if (/^\/admin\/accommodations\/.+\/edit/.test(path)) return "Edit accommodation";
  if (path.startsWith("/admin/accommodations")) return "Accommodations";
  if (path.startsWith("/admin/bookings")) return "Bookings";
  if (path.startsWith("/admin/students")) return "Students";
  if (path.startsWith("/admin/roles")) return "Roles";
  if (path.startsWith("/admin/feedback")) return "Feedback";
  if (path.startsWith("/admin/contact")) return "Contact messages";
  return "Dashboard";
}

function SidebarContent({ user, onNavigate, onLogout }) {
  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim();

  return (
    <div className="flex h-full flex-col bg-primary-900 text-white">
      <div className="flex h-16 shrink-0 items-center gap-2.5 px-5">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-500 to-accent-600 text-white shadow-lg shadow-accent-500/30">
          <ShieldCheck size={21} />
        </span>
        <div className="leading-tight">
          <p className="text-lg font-extrabold">UniNest</p>
          <p className="text-[11px] font-bold uppercase tracking-wider text-primary-300">Admin</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {groups.map((g) => (
          <div key={g.title}>
            <p className="px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-wider text-primary-300">
              {g.title}
            </p>
            <div className="space-y-1">
              {g.items.map(({ to, label, Icon, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-white/15 text-white"
                        : "text-primary-200 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <span className="absolute bottom-2 left-0 top-2 w-1 rounded-r-full bg-accent-500" />
                      )}
                      <Icon size={19} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 space-y-2 border-t border-white/10 p-3">
        <Link
          to="/home"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
        >
          <ExternalLink size={18} /> Student view
        </Link>

        <div className="flex items-center gap-3 rounded-2xl bg-white/10 p-3">
          <Avatar src={user?.image} name={fullName} size={38} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold">{fullName || "Admin"}</p>
            <p className="truncate text-xs text-primary-300">{user?.email}</p>
          </div>
          <button
            onClick={onLogout}
            title="Log out"
            className="rounded-lg p-2 text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser] = useState(getUser);
  const [drawer, setDrawer] = useState(false);

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
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 lg:block">
        <SidebarContent user={user} onLogout={logout} />
      </aside>

      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-white px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={() => setDrawer(true)}
              aria-label="Open menu"
              className="rounded-xl p-2 text-ink transition-colors hover:bg-slate-100 lg:hidden"
            >
              <Menu size={22} />
            </button>
            <h2 className="truncate text-lg font-extrabold text-ink">{titleFor(pathname)}</h2>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/admin/accommodations/new"
              className="hidden items-center gap-1.5 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-primary-700 sm:flex"
            >
              <Plus size={17} /> Add listing
            </Link>
            <Avatar
              src={user?.image}
              name={`${user?.firstName || ""} ${user?.lastName || ""}`}
              size={36}
            />
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setDrawer(false)}
            className="fixed inset-0 z-50 bg-ink/50 lg:hidden"
          >
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              className="absolute inset-y-0 left-0 w-72 max-w-[85vw]"
            >
              <SidebarContent
                user={user}
                onNavigate={() => setDrawer(false)}
                onLogout={logout}
              />
              <button
                onClick={() => setDrawer(false)}
                aria-label="Close menu"
                className="absolute right-3 top-3.5 rounded-lg p-2 text-primary-200 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}