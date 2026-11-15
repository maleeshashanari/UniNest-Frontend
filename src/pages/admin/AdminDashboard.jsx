import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  BedDouble,
  Building2,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Inbox,
  MessageSquare,
  Plus,
  RefreshCw,
  Star,
  Users,
} from "lucide-react";

import { getAllAccommodations } from "../../api/accommodations";
import { getAllBookings } from "../../api/bookings";
import { getAllContactMessages } from "../../api/contact";
import { getAllFeedback } from "../../api/feedback";
import { getAllStudents } from "../../api/users";
import Avatar from "../../components/Avatar";
import StatCard from "../../components/StatCard";
import StatusBadge from "../../components/StatusBadge";
import { BOOKING_STATUSES } from "../../data/bookingOptions";
import { getUser } from "../../utils/auth";
import { formatDate } from "../../utils/format";

const STATUS_BAR = {
  Pending: "bg-warning",
  Confirmed: "bg-primary-500",
  Occupied: "bg-success",
  Completed: "bg-slate-400",
  Rejected: "bg-danger",
  Cancelled: "bg-slate-300",
};

const glow = {
  background:
    "radial-gradient(circle at 10% 20%, rgba(255,107,74,.35), transparent 40%), radial-gradient(circle at 92% 85%, rgba(165,180,252,.3), transparent 45%)",
};

function Card({ title, action, children, className = "" }) {
  return (
    <section className={`rounded-3xl border border-border bg-white p-5 sm:p-6 ${className}`}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-extrabold text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Skeleton({ className = "" }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />;
}

function Donut({ pct }) {
  return (
    <div className="relative mx-auto h-44 w-44">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="3.5" className="stroke-slate-100" />
        <motion.circle
          cx="18"
          cy="18"
          r="15.9155"
          fill="none"
          strokeWidth="3.5"
          strokeLinecap={pct > 0 ? "round" : "butt"}
          className="stroke-primary-600"
          initial={{ strokeDasharray: "0 100" }}
          animate={{ strokeDasharray: `${pct} ${100 - pct}` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-3xl font-extrabold text-ink">{pct}%</p>
        <p className="text-xs font-semibold text-muted">occupied</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const user = getUser();
  const [today] = useState(() => new Date());
  const hour = today.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [state, setState] = useState({ loading: true, data: null, failed: 0, loadedAt: 0 });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.allSettled([
      getAllAccommodations(),
      getAllBookings(),
      getAllFeedback(),
      getAllContactMessages(),
      getAllStudents(),
    ]).then((r) => {
      if (cancelled) return;
      // null means "this request failed", so one broken endpoint never blanks the page
      const pick = (i, key) => (r[i].status === "fulfilled" ? r[i].value?.[key] || [] : null);
      const data = {
        acc: pick(0, "accommodations"),
        bookings: pick(1, "bookings"),
        feedback: pick(2, "feedbacks"),
        contacts: pick(3, "contacts"),
        students: pick(4, "students"),
      };
      setState({
        loading: false,
        data,
        failed: Object.values(data).filter((v) => v === null).length,
        loadedAt: Date.now(),
      });
    });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setState({ loading: true, data: null, failed: 0, loadedAt: 0 });
    setReloadKey((k) => k + 1);
  };

  const { loading, data, failed, loadedAt } = state;

  const m = useMemo(() => {
    if (!data) return null;
    const acc = data.acc || [];
    const bookings = data.bookings || [];
    const feedback = data.feedback || [];
    const contacts = data.contacts || [];
    const students = data.students || [];

    const totalRooms = acc.reduce((s, a) => s + (a.totalRooms || 0), 0);
    const freeRooms = acc.reduce((s, a) => s + (a.availableRooms || 0), 0);
    const occupancy = totalRooms ? Math.round(((totalRooms - freeRooms) / totalRooms) * 100) : 0;

    const avg = feedback.length ? feedback.reduce((s, f) => s + f.rating, 0) / feedback.length : null;

    const statusCounts = BOOKING_STATUSES.map((s) => ({
      status: s,
      count: bookings.filter((b) => b.status === s).length,
    }));

    const ratingDist = [5, 4, 3, 2, 1].map((n) => ({
      n,
      count: feedback.filter((f) => f.rating === n).length,
    }));

    // Booking requests for the last 6 months
    const months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date(loadedAt);
      d.setDate(1);
      d.setMonth(d.getMonth() - (5 - i));
      return {
        key: `${d.getFullYear()}-${d.getMonth()}`,
        label: d.toLocaleString("en-GB", { month: "short" }),
        count: 0,
      };
    });
    bookings.forEach((b) => {
      const d = new Date(b.createdAt);
      const hit = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
      if (hit) hit.count += 1;
    });

    // Latest reviews and messages in one feed
    const activity = [
      ...feedback.map((f) => ({
        id: `f-${f._id}`,
        type: "review",
        title: `${f.studentName} reviewed ${f.accommodation?.title || "a stay"}`,
        text: f.comment,
        rating: f.rating,
        date: f.createdAt,
        to: "/admin/feedback",
      })),
      ...contacts.map((c) => ({
        id: `c-${c._id}`,
        type: "message",
        title: `${c.studentName}: ${c.subject}`,
        text: c.message,
        date: c.createdAt,
        to: "/admin/contact",
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);

    return {
      listings: data.acc ? acc.length : null,
      students: data.students ? students.length : null,
      pendingBookings: data.bookings ? bookings.filter((b) => b.status === "Pending").length : null,
      avg,
      freeRooms: data.acc ? freeRooms : null,
      occupancy,
      awaitingReply: data.feedback ? feedback.filter((f) => !f.adminReply).length : null,
      pendingMessages: data.contacts ? contacts.filter((c) => c.status === "Pending").length : null,
      blocked: students.filter((s) => s.isBlocked).length,
      soldOut: acc.filter((a) => a.availableRooms === 0).length,
      statusCounts,
      ratingDist,
      totalReviews: feedback.length,
      months,
      maxMonth: Math.max(1, ...months.map((x) => x.count)),
      activity,
      recentBookings: bookings.slice(0, 5),
      hasBookings: bookings.length > 0,
    };
  }, [data, loadedAt]);

  const attention = m
    ? [
        { label: "booking requests waiting", count: m.pendingBookings, to: "/admin/bookings", Icon: CalendarCheck, tone: "bg-warning/10 text-warning" },
        { label: "reviews need a reply", count: m.awaitingReply, to: "/admin/feedback", Icon: MessageSquare, tone: "bg-primary-50 text-primary-600" },
        { label: "new messages unread", count: m.pendingMessages, to: "/admin/contact", Icon: Inbox, tone: "bg-accent-50 text-accent-600" },
        { label: "listings are sold out", count: m.soldOut, to: "/admin/accommodations", Icon: Building2, tone: "bg-danger/10 text-danger" },
      ].filter((a) => a.count > 0)
    : [];

  const allFailed = !loading && failed === 5;
  const maxStatus = m ? Math.max(1, ...m.statusCounts.map((s) => s.count)) : 1;
  const maxRating = m ? Math.max(1, ...m.ratingDist.map((r) => r.count)) : 1;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 p-6 text-white sm:p-9"
      >
        <div className="absolute inset-0" style={glow} />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-200">
              {today.toLocaleDateString("en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">
              {greeting}, {user?.firstName || "Admin"}
            </h1>
            <p className="mt-1 text-sm text-primary-100">Here is what is happening on UniNest today.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/admin/accommodations/new"
              className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary-700 shadow-lg transition-transform hover:-translate-y-0.5"
            >
              <Plus size={17} /> Add accommodation
            </Link>
            <Link
              to="/admin/bookings"
              className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20"
            >
              <CalendarCheck size={17} /> Review bookings
            </Link>
          </div>
        </div>
      </motion.section>

      {allFailed ? (
        <div className="rounded-3xl border border-danger/20 bg-danger/5 p-10 text-center">
          <p className="font-bold text-danger">Could not load the dashboard</p>
          <p className="mt-1 text-sm text-muted">Check that the backend is running and try again.</p>
          <button
            onClick={retry}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm"
          >
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      ) : (
        <>
          {!loading && failed > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-warning/30 bg-warning/5 px-4 py-3 text-sm">
              <p className="font-semibold text-ink">
                {failed} section{failed > 1 ? "s" : ""} could not be loaded, so some numbers show a dash.
              </p>
              <button onClick={retry} className="inline-flex items-center gap-1.5 font-bold text-primary-600">
                <RefreshCw size={15} /> Reload
              </button>
            </div>
          )}

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Building2} label="Total listings" value={m?.listings} loading={loading} tone="bg-primary-50 text-primary-600" to="/admin/accommodations" />
            <StatCard icon={Users} label="Students" value={m?.students} loading={loading} tone="bg-success/10 text-success" to="/admin/students" hint={m?.blocked ? `${m.blocked} blocked` : undefined} />
            <StatCard icon={CalendarCheck} label="Pending bookings" value={m?.pendingBookings} loading={loading} tone="bg-warning/10 text-warning" to="/admin/bookings" />
            <StatCard icon={Star} label="Average rating" value={m?.avg != null ? m.avg.toFixed(1) : m ? "–" : null} loading={loading} tone="bg-accent-50 text-accent-600" to="/admin/feedback" hint={m?.totalReviews ? `${m.totalReviews} reviews` : undefined} />
            <StatCard icon={BedDouble} label="Rooms available" value={m?.freeRooms} loading={loading} tone="bg-primary-50 text-primary-600" />
            <StatCard icon={Gauge} label="Occupancy" value={m && m.listings != null ? `${m.occupancy}%` : null} loading={loading} tone="bg-success/10 text-success" />
            <StatCard icon={MessageSquare} label="Reviews to reply" value={m?.awaitingReply} loading={loading} tone="bg-warning/10 text-warning" to="/admin/feedback" />
            <StatCard icon={Inbox} label="New messages" value={m?.pendingMessages} loading={loading} tone="bg-accent-50 text-accent-600" to="/admin/contact" />
          </div>

          {/* Charts row */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Booking requests" className="lg:col-span-2" action={<span className="text-xs font-semibold text-muted">Last 6 months</span>}>
              {loading ? (
                <Skeleton className="h-48" />
              ) : (
                <div className="flex gap-3">
                  {m.months.map((x, i) => (
                    <div key={x.key} className="flex flex-1 flex-col">
                      <div className="flex h-40 flex-col items-center justify-end">
                        <span className="mb-1 text-xs font-bold text-ink">{x.count}</span>
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: `${Math.max(4, (x.count / m.maxMonth) * 82)}%` }}
                          transition={{ duration: 0.6, delay: i * 0.06, ease: "easeOut" }}
                          className={`w-full max-w-[44px] rounded-t-xl ${
                            i === m.months.length - 1
                              ? "bg-gradient-to-t from-primary-600 to-primary-400"
                              : "bg-primary-100"
                          }`}
                        />
                      </div>
                      <p className="mt-2 text-center text-xs font-semibold text-muted">{x.label}</p>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Room occupancy">
              {loading ? (
                <Skeleton className="mx-auto h-44 w-44 !rounded-full" />
              ) : (
                <>
                  <Donut pct={m.occupancy} />
                  <p className="mt-4 text-center text-sm text-muted">
                    <span className="font-bold text-ink">{m.freeRooms ?? 0}</span> rooms free across{" "}
                    <span className="font-bold text-ink">{m.listings ?? 0}</span> listings
                  </p>
                </>
              )}
            </Card>
          </div>

          {/* Attention + recent bookings */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Needs your attention">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <Skeleton key={n} className="h-14" />
                  ))}
                </div>
              ) : attention.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle2 size={40} className="mx-auto text-success" />
                  <p className="mt-2 font-bold text-ink">All caught up</p>
                  <p className="text-sm text-muted">Nothing is waiting for you.</p>
                </div>
              ) : (
                <ul className="space-y-2">
                  {attention.map(({ label, count, to, Icon, tone }) => (
                    <li key={label}>
                      <Link
                        to={to}
                        className="group flex items-center gap-3 rounded-2xl p-2.5 transition-colors hover:bg-slate-50"
                      >
                        <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tone}`}>
                          <Icon size={20} />
                        </span>
                        <span className="min-w-0 flex-1 text-sm text-muted">
                          <span className="block text-lg font-extrabold leading-none text-ink">{count}</span>
                          {label}
                        </span>
                        <ChevronRight size={18} className="text-slate-300 transition-transform group-hover:translate-x-1" />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            <Card
              title="Recent bookings"
              className="lg:col-span-2"
              action={
                <Link to="/admin/bookings" className="text-sm font-bold text-primary-600 hover:text-primary-700">
                  Manage all
                </Link>
              }
            >
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <Skeleton key={n} className="h-16" />
                  ))}
                </div>
              ) : !m.hasBookings ? (
                <p className="rounded-2xl bg-slate-50 p-8 text-center text-sm text-muted">
                  No booking requests yet.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {m.recentBookings.map((b) => (
                    <li key={b._id}>
                      <Link
                        to="/admin/bookings"
                        className="flex items-center gap-3 py-3 transition-colors hover:bg-slate-50/70"
                      >
                        <Avatar name={b.studentName} size={40} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-bold text-ink">{b.studentName}</p>
                          <p className="truncate text-xs text-muted">
                            {b.accommodation?.title || "Removed listing"} · {formatDate(b.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          {/* Status, ratings, activity */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card title="Bookings by status">
              {loading ? (
                <Skeleton className="h-48" />
              ) : (
                <div className="space-y-3">
                  {m.statusCounts.map((s) => (
                    <div key={s.status}>
                      <div className="mb-1 flex justify-between text-xs font-bold">
                        <span className="text-ink">{s.status}</span>
                        <span className="text-muted">{s.count}</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(s.count / maxStatus) * 100}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className={`h-full rounded-full ${STATUS_BAR[s.status]}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Rating spread">
              {loading ? (
                <Skeleton className="h-48" />
              ) : m.totalReviews === 0 ? (
                <p className="py-10 text-center text-sm text-muted">No reviews yet.</p>
              ) : (
                <div className="space-y-3">
                  {m.ratingDist.map((r) => (
                    <div key={r.n} className="flex items-center gap-3 text-xs">
                      <span className="flex w-8 items-center gap-0.5 font-bold text-ink">
                        {r.n}
                        <Star size={12} className="fill-warning text-warning" />
                      </span>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(r.count / maxRating) * 100}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full bg-warning"
                        />
                      </div>
                      <span className="w-6 text-right font-semibold text-muted">{r.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card title="Latest activity" action={<Activity size={18} className="text-muted" />}>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((n) => (
                    <Skeleton key={n} className="h-14" />
                  ))}
                </div>
              ) : m.activity.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted">Nothing yet.</p>
              ) : (
                <ul className="space-y-3">
                  {m.activity.map((a) => (
                    <li key={a.id}>
                      <Link to={a.to} className="group flex gap-3">
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                            a.type === "review" ? "bg-warning/10 text-warning" : "bg-accent-50 text-accent-600"
                          }`}
                        >
                          {a.type === "review" ? <Star size={15} /> : <Inbox size={15} />}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-bold text-ink group-hover:text-primary-600">
                            {a.title}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {a.type === "review" ? `${"★".repeat(a.rating)} · ` : ""}
                            {a.text}
                          </span>
                          <span className="block text-[11px] text-slate-400">{formatDate(a.date)}</span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}