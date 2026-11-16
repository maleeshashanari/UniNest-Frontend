import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BedDouble,
  Bell,
  Building,
  Building2,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  Check,
  DoorOpen,
  GraduationCap,
  Headset,
  Hourglass,
  Home as HomeIcon,
  MessageSquare,
  Search,
  ShieldCheck,
  Star,
} from "lucide-react";

import { getMyBookings } from "../api/bookings";
import { getPublicAccommodations } from "../api/accommodations";
import { getMyContactMessages } from "../api/contact";
import { getMyFeedback } from "../api/feedback";
import AccommodationCard from "../components/AccommodationCard";
import CardSkeleton from "../components/CardSkeleton";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { STATUS_HINTS } from "../data/bookingOptions";
import { getUser } from "../utils/auth";
import { coverImage, formatDate, formatLKR } from "../utils/format";

const HERO_IMAGE = "/images/dashboard-hero.jpg";
const HELP_IMAGE = "/images/help-banner.jpg";

const TYPE_CHIPS = [
  { type: "Hostel", Icon: Building2 },
  { type: "Boarding", Icon: BedDouble },
  { type: "Apartment", Icon: Building },
  { type: "Annex", Icon: DoorOpen },
  { type: "House", Icon: HomeIcon },
];

const STEPS = ["Requested", "Confirmed", "Moved in", "Completed"];
const STEP_INDEX = { Pending: 0, Confirmed: 1, Occupied: 2, Completed: 3 };

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4, delay, ease: "easeOut" },
});

// Background photo that quietly disappears if the file does not exist
function BackgroundImage({ src }) {
  const [failed, setFailed] = useState(false);
  if (failed) return null;
  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className="absolute inset-0 h-full w-full object-cover"
    />
  );
}

function ProgressRing({ pct }) {
  return (
    <div className="relative h-16 w-16 shrink-0">
      <svg viewBox="0 0 36 36" className="h-full w-full -rotate-90">
        <circle cx="18" cy="18" r="15.9155" fill="none" strokeWidth="4" className="stroke-slate-100" />
        <motion.circle
          cx="18"
          cy="18"
          r="15.9155"
          fill="none"
          strokeWidth="4"
          strokeLinecap={pct > 0 ? "round" : "butt"}
          className="stroke-primary-600"
          initial={{ strokeDasharray: "0 100" }}
          animate={{ strokeDasharray: `${pct} ${100 - pct}` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-ink">
        {pct}%
      </span>
    </div>
  );
}

function Panel({ title, action, children, className = "" }) {
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

export default function Home() {
  const navigate = useNavigate();
  const user = getUser();
  const isStudent = user?.role === "student";
  const [hour] = useState(() => new Date().getHours());
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  const [query, setQuery] = useState("");
  const [state, setState] = useState({
    loading: true,
    stays: [],
    nearMe: false,
    bookings: [],
    reviews: null,
    contacts: null,
    daysLeft: null,
  });

  useEffect(() => {
    let cancelled = false;

    const tasks = [getPublicAccommodations()];
    if (isStudent) tasks.push(getMyBookings(), getMyFeedback(), getMyContactMessages());

    Promise.allSettled(tasks).then((r) => {
      if (cancelled) return;

      // One failed request never breaks the whole dashboard
      const pick = (i, key) => (r[i]?.status === "fulfilled" ? r[i].value?.[key] || [] : null);

      const allStays = pick(0, "accommodations") || [];
      const bookings = isStudent ? pick(1, "bookings") || [] : [];

      // Stays near the student's university come first
      const uni = (getUser()?.university || "").trim().toLowerCase();
      const isNear = (a) => Boolean(uni) && (a.university || "").trim().toLowerCase() === uni;
      const ranked = [...allStays].sort((a, b) => Number(isNear(b)) - Number(isNear(a)));

      // Days until the move-in of the newest confirmed booking
      const confirmed = bookings.find((b) => b.status === "Confirmed");
      const daysLeft = confirmed
        ? Math.max(0, Math.ceil((new Date(confirmed.moveInDate).getTime() - Date.now()) / 86400000))
        : null;

      setState({
        loading: false,
        stays: ranked.slice(0, 8),
        nearMe: ranked.some(isNear),
        bookings,
        reviews: isStudent ? pick(2, "feedbacks") : null,
        contacts: isStudent ? pick(3, "contacts") : null,
        daysLeft,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [isStudent]);

  const { loading, stays, nearMe, bookings, reviews, contacts, daysLeft } = state;

  const search = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/accommodations?q=${encodeURIComponent(q)}` : "/accommodations");
  };

  // ----- Derived data -----
  const active = bookings.find((b) => ["Pending", "Confirmed", "Occupied"].includes(b.status));
  const activeStays = bookings.filter((b) => ["Confirmed", "Occupied"].includes(b.status)).length;
  const pending = bookings.filter((b) => b.status === "Pending").length;
  const openMessages = contacts ? contacts.filter((c) => c.status !== "Resolved").length : null;

  const hasPhoto = /^(https?:\/\/|data:image\/)/i.test(user?.image || "");
  const checklist = [
    { label: "Create your account", done: true, to: null },
    { label: "Add your phone number", done: Boolean(user?.phone), to: "/profile" },
    { label: "Choose your university", done: Boolean(user?.university), to: "/profile" },
    { label: "Add a profile photo", done: hasPhoto, to: "/profile" },
    { label: "Request your first stay", done: bookings.length > 0, to: "/accommodations" },
    { label: "Write a review", done: Boolean(reviews?.length), to: "/accommodations" },
  ];
  const doneCount = checklist.filter((c) => c.done).length;
  const pct = Math.round((doneCount / checklist.length) * 100);

  // Everything the admin did for this student, newest first
  const updates = [
    ...bookings
      .filter((b) => b.status !== "Pending")
      .map((b) => ({
        id: `b-${b._id}`,
        Icon: CalendarCheck,
        tone: "bg-primary-50 text-primary-600",
        title: `${b.accommodation?.title || "Your booking"} is ${b.status.toLowerCase()}`,
        text: b.adminNote || STATUS_HINTS[b.status],
        date: b.updatedAt || b.createdAt,
        to: "/my-bookings",
      })),
    ...(contacts || [])
      .filter((c) => c.adminReply)
      .map((c) => ({
        id: `c-${c._id}`,
        Icon: MessageSquare,
        tone: "bg-accent-50 text-accent-600",
        title: `UniNest replied: ${c.subject}`,
        text: c.adminReply,
        date: c.repliedAt || c.updatedAt,
        to: "/contact",
      })),
    ...(reviews || [])
      .filter((f) => f.adminReply)
      .map((f) => ({
        id: `f-${f._id}`,
        Icon: Star,
        tone: "bg-warning/10 text-warning",
        title: `UniNest replied to your review of ${f.accommodation?.title || "a stay"}`,
        text: f.adminReply,
        date: f.repliedAt || f.updatedAt,
        to: "/my-reviews",
      })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const step = active ? STEP_INDEX[active.status] : -1;

  return (
    <div className="space-y-6">
      {/* ================= Hero ================= */}
      <motion.section
        {...rise()}
        className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 text-white"
      >
        <BackgroundImage src={HERO_IMAGE} />
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 via-primary-900/60 to-primary-900/20" />

        <div className="relative p-6 sm:p-10">
          <p className="text-sm font-semibold text-primary-200">{greeting}</p>
          <h1 className="mt-1 max-w-xl text-3xl font-extrabold leading-tight sm:text-4xl">
            {user?.firstName ? `${user.firstName}, ` : ""}find your perfect nest near campus
          </h1>
          <p className="mt-2 max-w-lg text-sm text-primary-100">
            Verified hostels, boardings and annexes close to your university.
          </p>

          <form
            onSubmit={search}
            className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-primary-900/20"
          >
            <Search size={20} className="ml-3 shrink-0 text-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by city, area or university..."
              className="min-w-0 flex-1 bg-transparent px-2 py-3 text-sm text-ink outline-none placeholder:text-slate-400"
            />
            <button
              type="submit"
              className="shrink-0 rounded-xl bg-gradient-to-r from-primary-600 to-accent-500 px-5 py-3 text-sm font-bold text-white transition-transform hover:-translate-y-0.5"
            >
              Search
            </button>
          </form>

          <div className="mt-5 flex flex-wrap gap-2">
            {user?.university && (
              <Link
                to={`/accommodations?q=${encodeURIComponent(user.university)}`}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent-500 px-4 py-2 text-xs font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                <GraduationCap size={15} /> Near my university
              </Link>
            )}
            {TYPE_CHIPS.map(({ type, Icon }) => (
              <Link
                key={type}
                to={`/accommodations?type=${type}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/25"
              >
                <Icon size={15} /> {type}
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

            {/* ================= Guest banner ================= */}
      {!user && (
        <motion.div
          {...rise(0.05)}
          className="flex flex-col gap-4 rounded-3xl border border-primary-200 bg-primary-50/60 p-5 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-sm">
              <ShieldCheck size={22} />
            </span>
            <div>
              <p className="font-extrabold text-ink">You are browsing as a guest</p>
              <p className="text-sm text-muted">
                Create a free account to book stays, write reviews and contact UniNest.
              </p>
            </div>
          </div>
          <div className="flex shrink-0 gap-3">
            <Link
              to="/register"
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
            >
              Sign in
            </Link>
          </div>
        </motion.div>
      )}

      {/* ================= Stats ================= */}
      {isStudent && (
        <motion.div {...rise(0.08)} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={CalendarCheck} label="Active stays" value={activeStays} tone="bg-success/10 text-success" to="/my-bookings" loading={loading} />
          <StatCard icon={Hourglass} label="Pending requests" value={pending} tone="bg-warning/10 text-warning" to="/my-bookings" loading={loading} />
          <StatCard icon={Star} label="Reviews written" value={reviews ? reviews.length : null} tone="bg-primary-50 text-primary-600" to="/my-reviews" loading={loading} />
          <StatCard icon={MessageSquare} label="Open messages" value={openMessages} tone="bg-accent-50 text-accent-600" to="/contact" loading={loading} />
        </motion.div>
      )}

      {/* ================= Main grid ================= */}
      {isStudent && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Booking tracker */}
            <motion.div {...rise(0.12)}>
              <Panel
                title="Your current booking"
                action={
                  <Link to="/my-bookings" className="text-sm font-bold text-primary-600 hover:text-primary-700">
                    All bookings
                  </Link>
                }
              >
                {loading ? (
                  <div className="h-40 animate-pulse rounded-2xl bg-slate-100" />
                ) : !active ? (
                  <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-primary-300 bg-primary-50/50 p-8 text-center">
                    <CalendarClock size={34} className="text-primary-400" />
                    <div>
                      <p className="font-extrabold text-ink">No active booking</p>
                      <p className="text-sm text-muted">Find a place and send a booking request in a minute.</p>
                    </div>
                    <Link
                      to="/accommodations"
                      className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-700"
                    >
                      Browse stays
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link
                      to={active.accommodation ? `/accommodations/${active.accommodation._id}` : "/my-bookings"}
                      className="flex items-center gap-4 rounded-2xl bg-slate-50 p-3 transition-colors hover:bg-primary-50/60"
                    >
                      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-primary-50">
                        {coverImage(active.accommodation?.images) ? (
                          <img
                            src={coverImage(active.accommodation.images)}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-primary-300">
                            <Building2 size={22} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-extrabold text-ink">
                          {active.accommodation?.title || "Accommodation removed"}
                        </p>
                        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                          <CalendarDays size={13} /> Move-in {formatDate(active.moveInDate)}
                          {active.accommodation && <span> · {formatLKR(active.accommodation.monthlyRent)}/mo</span>}
                        </p>
                      </div>
                      <StatusBadge status={active.status} />
                    </Link>

                    {/* Progress line */}
                    <ol className="mt-6 flex items-start">
                      {STEPS.map((label, i) => {
                        const done = i < step;
                        const current = i === step;
                        return (
                          <li key={label} className="relative flex flex-1 flex-col items-center text-center">
                            {i > 0 && (
                              <span
                                className={`absolute right-1/2 top-4 h-0.5 w-full -translate-y-1/2 ${
                                  i <= step ? "bg-primary-600" : "bg-slate-200"
                                }`}
                              />
                            )}
                            <span
                              className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-extrabold ${
                                done
                                  ? "border-primary-600 bg-primary-600 text-white"
                                  : current
                                  ? "border-primary-600 bg-white text-primary-600 ring-4 ring-primary-100"
                                  : "border-slate-200 bg-white text-slate-400"
                              }`}
                            >
                              {done ? <Check size={15} /> : i + 1}
                            </span>
                            <span
                              className={`mt-2 text-[11px] font-bold sm:text-xs ${
                                i <= step ? "text-ink" : "text-slate-400"
                              }`}
                            >
                              {label}
                            </span>
                          </li>
                        );
                      })}
                    </ol>

                    <p className="mt-5 rounded-xl bg-primary-50 p-3 text-center text-sm font-semibold text-primary-700">
                      {active.status === "Confirmed" && daysLeft !== null
                        ? daysLeft === 0
                          ? "Move-in day is today. Welcome to your new nest!"
                          : `${daysLeft} ${daysLeft === 1 ? "day" : "days"} until you move in.`
                        : STATUS_HINTS[active.status]}
                    </p>
                  </>
                )}
              </Panel>
            </motion.div>

            {/* Updates */}
            <motion.div {...rise(0.16)}>
              <Panel title="Updates for you" action={<Bell size={18} className="text-muted" />}>
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((n) => (
                      <div key={n} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : updates.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-6 text-center text-sm text-muted">
                    You are all caught up. Booking decisions and replies from UniNest will show here.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {updates.map(({ id, Icon, tone, title, text, date, to }) => (
                      <li key={id}>
                        <Link
                          to={to}
                          className="group flex gap-3 rounded-2xl p-2.5 transition-colors hover:bg-slate-50"
                        >
                          <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                            <Icon size={18} />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-bold text-ink group-hover:text-primary-600">
                              {title}
                            </span>
                            <span className="block truncate text-xs text-muted">{text}</span>
                          </span>
                          <span className="shrink-0 text-[11px] text-slate-400">{formatDate(date)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {pct < 100 && (
              <motion.div {...rise(0.14)}>
                <Panel title="Get started">
                  <div className="mb-4 flex items-center gap-4">
                    <ProgressRing pct={pct} />
                    <p className="text-sm text-muted">
                      <span className="font-extrabold text-ink">
                        {doneCount} of {checklist.length}
                      </span>{" "}
                      steps done. Complete them to get the most out of UniNest.
                    </p>
                  </div>
                  <ul className="space-y-1">
                    {checklist.map(({ label, done, to }) => {
                      const row = (
                        <>
                          <span
                            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                              done ? "bg-success text-white" : "border-2 border-slate-200"
                            }`}
                          >
                            {done && <Check size={14} />}
                          </span>
                          <span
                            className={`flex-1 text-sm font-semibold ${
                              done ? "text-muted line-through" : "text-ink"
                            }`}
                          >
                            {label}
                          </span>
                          {!done && to && <ArrowRight size={15} className="text-slate-300" />}
                        </>
                      );
                      return (
                        <li key={label}>
                          {done || !to ? (
                            <div className="flex items-center gap-3 rounded-xl p-2">{row}</div>
                          ) : (
                            <Link
                              to={to}
                              className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
                            >
                              {row}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Panel>
              </motion.div>
            )}

            {/* Recent bookings */}
            <motion.div {...rise(0.18)}>
              <Panel title="Recent requests">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2].map((n) => (
                      <div key={n} className="h-14 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : bookings.length === 0 ? (
                  <p className="rounded-2xl bg-slate-50 p-5 text-center text-sm text-muted">
                    No booking requests yet.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {bookings.slice(0, 4).map((b) => (
                      <li key={b._id}>
                        <Link
                          to="/my-bookings"
                          className="flex items-center gap-3 rounded-2xl p-2 transition-colors hover:bg-slate-50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-ink">
                              {b.accommodation?.title || "Accommodation removed"}
                            </p>
                            <p className="text-xs text-muted">{formatDate(b.moveInDate)}</p>
                          </div>
                          <StatusBadge status={b.status} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </Panel>
            </motion.div>
          </div>
        </div>
      )}

      {/* ================= Stays carousel ================= */}
      <motion.section {...rise(0.2)}>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-ink">
              {nearMe ? "Stays near your university" : "Latest stays"}
            </h2>
            <p className="text-sm text-muted">
              {nearMe ? `Close to ${user?.university}` : "Freshly listed places you might like."}
            </p>
          </div>
          <Link to="/accommodations" className="text-sm font-bold text-primary-600 hover:text-primary-700">
            See all
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : stays.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white p-10 text-center">
            <Building2 size={36} className="mx-auto text-primary-300" />
            <p className="mt-2 text-sm font-semibold text-muted">No stays have been listed yet.</p>
          </div>
        ) : (
          <div className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-3">
            {stays.map((item) => (
              <div key={item._id} className="w-72 shrink-0 snap-start sm:w-80">
                <AccommodationCard item={item} />
              </div>
            ))}
          </div>
        )}
      </motion.section>

      {/* ================= Help banner ================= */}
      {isStudent && (
        <motion.section
          {...rise(0.24)}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-800 to-primary-600 text-white"
        >
          <BackgroundImage src={HELP_IMAGE} />
          <div className="absolute inset-0 bg-primary-900/70" />
          <div className="relative flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
                <Headset size={24} />
              </span>
              <div>
                <p className="text-lg font-extrabold">Need help with a stay?</p>
                <p className="text-sm text-primary-100">
                  Report a problem or ask a question and the UniNest team will reply.
                </p>
              </div>
            </div>
            <Link
              to="/contact"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-primary-700 transition-transform hover:-translate-y-0.5"
            >
              <ShieldCheck size={17} /> Contact UniNest
            </Link>
          </div>
        </motion.section>
      )}
    </div>
  );
}