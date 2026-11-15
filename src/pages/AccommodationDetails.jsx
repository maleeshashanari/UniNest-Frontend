import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  Check,
  GraduationCap,
  MapPin,
  Pencil,
  Phone,
  Users,
  Wallet,
} from "lucide-react";

import { getAccommodation } from "../api/accommodations";
import { formatLKR, isRealImage } from "../utils/format";
import { isAdmin } from "../utils/auth";
import BookingPanel from "../components/BookingPanel";

export default function AccommodationDetails() {
  const { id } = useParams();
  const admin = isAdmin();

  const [result, setResult] = useState({ id: null, item: null, error: "" });
  const [active, setActive] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getAccommodation(id)
      .then((data) => {
        if (!cancelled) setResult({ id, item: data.accommodation, error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setResult({
            id,
            item: null,
            error: err.response?.data?.message || "Could not load this accommodation",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (result.id !== id) {
    return <div className="h-96 animate-pulse rounded-3xl bg-slate-200" />;
  }

  if (result.error || !result.item) {
    return (
      <div className="rounded-2xl border border-border bg-white p-10 text-center">
        <p className="font-bold text-ink">{result.error || "Not found"}</p>
        <Link
          to="/accommodations"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-primary-600"
        >
          <ArrowLeft size={16} /> Back to all stays
        </Link>
      </div>
    );
  }

  const item = result.item;
  const images = (item.images || []).filter(isRealImage);
  const current = images[Math.min(active, images.length - 1)];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <Link
          to="/accommodations"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft size={16} /> All stays
        </Link>
        {admin && (
          <Link
            to={`/admin/accommodations/${item._id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-2 text-sm font-bold text-accent-600"
          >
            <Pencil size={16} /> Edit
          </Link>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {/* Gallery */}
          <div>
            <div className="aspect-[16/10] overflow-hidden rounded-3xl bg-primary-50">
              {current ? (
                <img src={current} alt={item.title} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-primary-300">
                  <Building2 size={64} />
                </div>
              )}
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {images.map((src, i) => (
                  <button
                    key={src}
                    onClick={() => setActive(i)}
                    className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                      i === active ? "border-primary-600" : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={src} alt="" loading="lazy" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="rounded-3xl border border-border bg-white p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-bold text-primary-700">
                {item.type}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-ink">
                {item.suitableFor === "Any" ? "Boys & Girls" : `For ${item.suitableFor}`}
              </span>
              {!item.isAvailable && (
                <span className="rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger">
                  Not available
                </span>
              )}
            </div>

            <h1 className="mt-3 text-2xl font-extrabold text-ink sm:text-3xl">{item.title}</h1>

            <p className="mt-2 flex items-start gap-1.5 text-sm text-muted">
              <MapPin size={16} className="mt-0.5 shrink-0" />
              {[item.location?.address, item.location?.city, item.location?.district]
                .filter(Boolean)
                .join(", ")}
            </p>
            {item.university && (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-muted">
                <GraduationCap size={16} className="shrink-0" /> Near {item.university}
              </p>
            )}

            <h2 className="mt-6 font-extrabold text-ink">About this place</h2>
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-600">
              {item.description}
            </p>

            {item.amenities?.length > 0 && (
              <>
                <h2 className="mt-6 font-extrabold text-ink">Amenities</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.amenities.map((a) => (
                    <span
                      key={a}
                      className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1.5 text-xs font-bold text-success"
                    >
                      <Check size={14} /> {a}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Price card */}
        <aside className="h-fit rounded-3xl border border-border bg-white p-6 lg:sticky lg:top-24">
          <p className="text-3xl font-extrabold text-primary-600">
            {formatLKR(item.monthlyRent)}
            <span className="text-sm font-medium text-muted"> /month</span>
          </p>

          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted">
                <Wallet size={16} /> Security deposit
              </dt>
              <dd className="font-bold text-ink">{formatLKR(item.securityDeposit)}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted">
                <BedDouble size={16} /> Rooms available
              </dt>
              <dd className="font-bold text-ink">
                {item.availableRooms} of {item.totalRooms}
              </dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="flex items-center gap-2 text-muted">
                <Users size={16} /> Suitable for
              </dt>
              <dd className="font-bold text-ink">{item.suitableFor}</dd>
            </div>
          </dl>

          <a
            href={`tel:${(item.contactNumber || "").replace(/\s/g, "")}`}
            className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30"
          >
            <Phone size={18} /> Call {item.contactNumber}
          </a>
          {!admin && <BookingPanel item={item} />}
        </aside>
      </div>
    </motion.div>
  );
}