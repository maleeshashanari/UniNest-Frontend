import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Building2, CalendarCheck, ExternalLink, LayoutDashboard, LogOut, MessageSquare, ShieldCheck, UserCog, Users, Mail, Inbox } from "lucide-react";

import Avatar from "./Avatar";
import { clearSession, getUser } from "../utils/auth";

const links = [
  { to: "/admin", label: "Dashboard", Icon: LayoutDashboard, end: true },
  { to: "/admin/accommodations", label: "Accommodations", Icon: Building2, end: false },
  { to: "/admin/bookings", label: "Bookings", Icon: CalendarCheck, end: false },
  { to: "/admin/feedback", label: "Feedback", Icon: MessageSquare, end: false },
  { to: "/admin/students", label: "Students", Icon: Users, end: false },
  { to: "/admin/roles", label: "Roles", Icon: UserCog, end: false },
  { to: "/contact", label: "Contact", Icon: Mail, studentOnly: true },
  { to: "/admin/contact", label: "Contact", Icon: Inbox, end: false },
];

export default function AdminLayout() {
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
      <header className="sticky top-0 z-40 bg-primary-900 text-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4">
          <div className="flex items-center gap-2 text-lg font-extrabold">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500 text-white">
              <ShieldCheck size={20} />
            </span>
            <span className="hidden sm:inline">UniNest Admin</span>
          </div>

          <nav className="flex items-center gap-1">
            {links.map(({ to, label, Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-primary-200 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span className="hidden sm:inline">{label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              to="/home"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ExternalLink size={16} />
              <span className="hidden md:inline">Student view</span>
            </Link>
            <Avatar
              src={user?.image}
              name={`${user?.firstName || ""} ${user?.lastName || ""}`}
              size={34}
            />
            <button
              onClick={logout}
              title="Log out"
              className="rounded-lg p-2 text-primary-200 transition-colors hover:bg-white/10 hover:text-white"
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