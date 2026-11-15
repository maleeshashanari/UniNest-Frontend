import { useState } from "react";
import { Link } from "react-router-dom";
import { BedDouble, Building2, GraduationCap, MapPin } from "lucide-react";
import { coverImage, formatLKR } from "../utils/format";

export default function AccommodationCard({ item }) {
  const [broken, setBroken] = useState(false);
  const cover = coverImage(item.images);

  return (
    <Link
      to={`/accommodations/${item._id}`}
      className="group overflow-hidden rounded-2xl border border-border bg-white transition-all hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg hover:shadow-primary-500/10"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-primary-50">
        {cover && !broken ? (
          <img
            src={cover}
            alt={item.title}
            loading="lazy"
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-primary-300">
            <Building2 size={48} />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-primary-700 shadow">
          {item.type}
        </span>
        <span className="absolute right-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs font-bold text-white">
          {item.suitableFor === "Any" ? "Boys & Girls" : item.suitableFor}
        </span>
      </div>

      <div className="p-4">
        <h3 className="truncate text-base font-extrabold text-ink">{item.title}</h3>

        <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
          <MapPin size={14} className="shrink-0" />
          {[item.location?.city, item.location?.district].filter(Boolean).join(", ")}
        </p>
        {item.university && (
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-muted">
            <GraduationCap size={14} className="shrink-0" />
            {item.university}
          </p>
        )}

        <div className="mt-4 flex items-end justify-between">
          <p className="text-lg font-extrabold text-primary-600">
            {formatLKR(item.monthlyRent)}
            <span className="text-xs font-medium text-muted"> /month</span>
          </p>
          <span className="flex items-center gap-1 text-xs font-semibold text-muted">
            <BedDouble size={14} /> {item.availableRooms} left
          </span>
        </div>
      </div>
    </Link>
  );
}