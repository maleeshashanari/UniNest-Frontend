import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    Building2,
    Search,
    ArrowRight,
    MapPin
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import AccommodationCard from "../../components/AccommodationCard";

export default function StudentHome() {
    const { user } = useAuth();

    const [accommodations, setAccommodations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAccommodations = async () => {
            try {
                const response = await api.get("/accommodations/public");

                setAccommodations(
                    response.data.accommodations || []
                );

            } catch (error) {
                toast.error(
                    error.response?.data?.message ||
                    "Unable to load accommodations."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAccommodations();
    }, []);

    const recentAccommodations = accommodations.slice(0, 3);

    return (
        <div className="mx-auto max-w-7xl space-y-8">

            <section className="overflow-hidden rounded-2xl bg-primary-600 p-7 text-white sm:p-10">

                <div className="max-w-2xl">

                    <p className="mb-3 text-sm font-medium text-white/80">
                        YOUR STUDENT ACCOMMODATION PLATFORM
                    </p>

                    <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
                        Find a place that feels like home, {user?.firstName}.
                    </h1>

                    <p className="mt-4 max-w-xl text-sm leading-6 text-white/80 sm:text-base">
                        Discover comfortable and affordable accommodation
                        near your university with UniNest.
                    </p>

                    <Link
                        to="/student/accommodations"
                        className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-semibold text-primary-700 transition hover:bg-gray-100"
                    >
                        Explore Accommodations
                        <ArrowRight size={18} />
                    </Link>

                </div>

            </section>

            <section className="grid gap-5 sm:grid-cols-2">

                <Link
                    to="/student/accommodations"
                    className="flex items-center gap-4 rounded-2xl border border-border bg-white p-6 transition hover:shadow-md"
                >
                    <div className="rounded-xl bg-primary-50 p-4 text-primary-600">
                        <Search size={25} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-ink">
                            Find Accommodation
                        </h3>

                        <p className="mt-1 text-sm text-muted">
                            Search and explore available places
                        </p>
                    </div>
                </Link>

                <div className="flex items-center gap-4 rounded-2xl border border-border bg-white p-6">
                    <div className="rounded-xl bg-orange-50 p-4 text-orange-600">
                        <Building2 size={25} />
                    </div>

                    <div>
                        <h3 className="font-semibold text-ink">
                            Available Listings
                        </h3>

                        <p className="mt-1 text-sm text-muted">
                            {accommodations.length} accommodations available
                        </p>
                    </div>
                </div>

            </section>

            <section>

                <div className="mb-5 flex items-center justify-between">

                    <div>
                        <h2 className="text-xl font-bold text-ink sm:text-2xl">
                            Explore Accommodations
                        </h2>

                        <p className="mt-1 text-sm text-muted">
                            Discover places that match your needs
                        </p>
                    </div>

                    <Link
                        to="/student/accommodations"
                        className="flex items-center gap-1 text-sm font-semibold text-primary-600 hover:underline"
                    >
                        View All
                        <ArrowRight size={16} />
                    </Link>

                </div>

                {loading ? (
                    <div className="py-16 text-center text-muted">
                        Loading accommodations...
                    </div>
                ) : recentAccommodations.length === 0 ? (
                    <div className="rounded-2xl border border-border bg-white py-16 text-center">
                        <Building2 size={40} className="mx-auto text-muted" />

                        <h3 className="mt-4 font-semibold text-ink">
                            No accommodations available
                        </h3>

                        <p className="mt-2 text-sm text-muted">
                            Please check again later.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {recentAccommodations.map((item) => (
                            <AccommodationCard
                                key={item._id}
                                accommodation={item}
                            />
                        ))}
                    </div>
                )}

            </section>

            <section className="rounded-2xl border border-border bg-white p-6 sm:p-8">

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                    <div>
                        <h2 className="text-lg font-bold text-ink">
                            Looking for accommodation near your university?
                        </h2>

                        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                            <MapPin size={16} />
                            Browse listings and find a convenient location.
                        </p>
                    </div>

                    <Link
                        to="/student/accommodations"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-5 py-3 text-sm font-semibold text-white hover:bg-primary-700"
                    >
                        Browse Now
                        <ArrowRight size={17} />
                    </Link>

                </div>

            </section>

        </div>
    );
}