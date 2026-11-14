import { Link } from "react-router-dom";
import {
    MapPin,
    BedDouble,
    Users,
    ArrowUpRight
} from "lucide-react";

export default function AccommodationCard({ accommodation }) {
    const image =
        accommodation.images?.[0] ||
        "/images/default-accommodation.png";

    return (
        <div className="overflow-hidden rounded-2xl border border-border bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg">

            <div className="relative h-52 overflow-hidden bg-gray-100">

                <img
                    src={image}
                    alt={accommodation.title}
                    className="h-full w-full object-cover transition duration-500 hover:scale-105"
                    onError={(e) => {
                        e.currentTarget.src = "/images/default-accommodation.png";
                    }}
                />

                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-primary-700 shadow">
                    {accommodation.type}
                </span>

                <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-semibold ${
                    accommodation.availableRooms > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                }`}>
                    {accommodation.availableRooms > 0 ? "Available" : "Fully Booked"}
                </span>

            </div>

            <div className="p-5">

                <div className="mb-2 flex items-start justify-between gap-2">

                    <h3 className="text-lg font-bold text-ink">
                        {accommodation.title}
                    </h3>

                    <span className="shrink-0 text-xs font-medium text-muted">
                        {accommodation.suitableFor}
                    </span>

                </div>

                <p className="mb-4 flex items-center gap-2 text-sm text-muted">
                    <MapPin size={16} />
                    {accommodation.location?.city || accommodation.location?.address || "Location not specified"}
                </p>

                <div className="mb-5 flex items-center gap-5 text-sm text-muted">

                    <span className="flex items-center gap-2">
                        <BedDouble size={17} />
                        {accommodation.availableRooms ?? 0} Rooms
                    </span>

                    <span className="flex items-center gap-2">
                        <Users size={17} />
                        {accommodation.university || "Any university"}
                    </span>

                </div>

                <div className="flex items-center justify-between border-t border-border pt-4">

                    <div>
                        <p className="text-xs text-muted">
                            Monthly Rent
                        </p>

                        <p className="text-lg font-bold text-primary-600">
                            Rs. {Number(accommodation.monthlyRent || 0).toLocaleString()}
                        </p>
                    </div>

                    <Link
                        to={`/student/accommodations/${accommodation._id}`}
                        className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-700"
                    >
                        View Details
                        <ArrowUpRight size={16} />
                    </Link>

                </div>

            </div>

        </div>
    );
}