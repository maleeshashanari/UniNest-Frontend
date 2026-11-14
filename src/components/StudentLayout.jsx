import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
    GraduationCap,
    LayoutDashboard,
    Building2,
    CalendarDays,
    UserRound,
    Menu,
    X,
    LogOut,
    ChevronDown
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function StudentLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navigation = [
        {
            name: "Dashboard",
            path: "/student",
            icon: LayoutDashboard,
            end: true
        },
        {
            name: "Accommodations",
            path: "/student/accommodations",
            icon: Building2
        },
        {
            name: "My Bookings",
            path: "/student/bookings",
            icon: CalendarDays
        },
        {
            name: "My Profile",
            path: "/student/profile",
            icon: UserRound
        }
    ];

    return (
        <div className="min-h-screen bg-background">

            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-20 items-center justify-between border-b border-border px-6">

                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-primary-600 p-2 text-white">
                            <GraduationCap size={25} />
                        </div>

                        <span className="text-xl font-bold text-ink">
                            UniNest
                        </span>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="text-muted lg:hidden"
                    >
                        <X size={22} />
                    </button>

                </div>

                <div className="px-5 py-6">
                    <p className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-muted">
                        Student Menu
                    </p>

                    <nav className="space-y-2">

                        {navigation.map((item) => {
                            const Icon = item.icon;

                            return (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    end={item.end}
                                    onClick={() => setSidebarOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                                            isActive
                                                ? "bg-primary-600 text-white"
                                                : "text-muted hover:bg-gray-100 hover:text-ink"
                                        }`
                                    }
                                >
                                    <Icon size={19} />
                                    {item.name}
                                </NavLink>
                            );
                        })}

                    </nav>
                </div>

                <div className="mt-auto border-t border-border p-5">

                    <div className="mb-4 flex items-center gap-3">
                        <img
                            src={user?.image || "/images/default-profile.png"}
                            alt="Profile"
                            className="h-10 w-10 rounded-full border border-border object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "/images/default-profile.png";
                            }}
                        />

                        <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-ink">
                                {user?.firstName} {user?.lastName}
                            </p>

                            <p className="truncate text-xs text-muted">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                        <LogOut size={18} />
                        Logout
                    </button>

                </div>
            </aside>

            <div className="lg:pl-64">

                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-border bg-white px-5 sm:px-8">

                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-ink lg:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    <div className="hidden sm:block">
                        <p className="text-sm text-muted">
                            Student Portal
                        </p>

                        <p className="font-semibold text-ink">
                            Welcome back, {user?.firstName}
                        </p>
                    </div>

                    <div className="relative ml-auto">

                        <button
                            onClick={() => setProfileOpen(!profileOpen)}
                            className="flex items-center gap-2 rounded-lg px-2 py-2 hover:bg-gray-50"
                        >
                            <img
                                src={user?.image || "/images/default-profile.png"}
                                alt="Profile"
                                className="h-9 w-9 rounded-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.src = "/images/default-profile.png";
                                }}
                            />

                            <span className="hidden text-sm font-medium text-ink sm:block">
                                {user?.firstName}
                            </span>

                            <ChevronDown size={16} className="text-muted" />
                        </button>

                        {profileOpen && (
                            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-border bg-white p-2 shadow-lg">

                                <NavLink
                                    to="/student/profile"
                                    onClick={() => setProfileOpen(false)}
                                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-ink hover:bg-gray-100"
                                >
                                    <UserRound size={17} />
                                    My Profile
                                </NavLink>

                                <button
                                    onClick={handleLogout}
                                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                                >
                                    <LogOut size={17} />
                                    Logout
                                </button>

                            </div>
                        )}

                    </div>

                </header>

                <main className="min-h-[calc(100vh-80px)] p-5 sm:p-8">
                    <Outlet />
                </main>

            </div>

        </div>
    );
}