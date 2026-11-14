import { useEffect, useMemo, useState } from "react";
import { Search, Building2 } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import AccommodationCard from "../../components/AccommodationCard";
import AccommodationFilters from "../../components/AccommodationFilters";

export default function Accommodations() {
    const [accommodations, setAccommodations] = useState([]);
    const [search, setSearch] = useState("");
    const [filters, setFilters] = useState({
        type: "",
        suitableFor: "",
        maxRent: ""
    });

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

    const filteredAccommodations = useMemo(() => {
        return accommodations.filter((item) => {
            const searchText = search.trim().toLowerCase();

            const matchesSearch =
                !searchText ||
                item.title?.toLowerCase().includes(searchText) ||
                item.location?.city?.toLowerCase().includes(searchText) ||
                item.location?.district?.toLowerCase().includes(searchText) ||
                item.location?.address?.toLowerCase().includes(searchText) ||
                item.university?.toLowerCase().includes(searchText);

            const matchesType =
                !filters.type || item.type === filters.type;

            const matchesGender =
                !filters.suitableFor ||
                filters.suitableFor === "Any" ||
                item.suitableFor === filters.suitableFor ||
                item.suitableFor === "Any";

            const matchesRent =
                !filters.maxRent ||
                Number(item.monthlyRent) <= Number(filters.maxRent);

            return (
                matchesSearch &&
                matchesType &&
                matchesGender &&
                matchesRent
            );
        });
    }, [accommodations, search, filters]);

    return (
        <div className="mx-auto max-w-7xl">

            <div className="mb-8">
                <h1 className="text-2xl font-bold text-ink sm:text-3xl">
                    Find Your Accommodation
                </h1>

                <p className="mt-2 text-sm text-muted sm:text-base">
                    Explore available hostels, boarding places, apartments and more.
                </p>
            </div>

            <div className="mb-7">

                <div className="relative">
                    <Search
                        size={20}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
                    />

                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by accommodation, location or university..."
                        className="w-full rounded-xl border border-border bg-white py-4 pl-12 pr-4 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                    />
                </div>

            </div>

            <div className="grid items-start gap-7 lg:grid-cols-[260px_1fr]">

                <AccommodationFilters
                    filters={filters}
                    setFilters={setFilters}
                />

                <section>

                    <div className="mb-5 flex items-center justify-between">
                        <div>
                            <h2 className="font-semibold text-ink">
                                Available Accommodations
                            </h2>

                            <p className="mt-1 text-sm text-muted">
                                {filteredAccommodations.length} result(s) found
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center text-muted">
                            Loading accommodations...
                        </div>
                    ) : filteredAccommodations.length === 0 ? (
                        <div className="rounded-2xl border border-border bg-white px-5 py-16 text-center">

                            <Building2
                                size={42}
                                className="mx-auto text-muted"
                            />

                            <h3 className="mt-4 font-semibold text-ink">
                                No accommodations found
                            </h3>

                            <p className="mt-2 text-sm text-muted">
                                Try changing your search or filters.
                            </p>

                            <button
                                onClick={() => {
                                    setSearch("");
                                    setFilters({
                                        type: "",
                                        suitableFor: "",
                                        maxRent: ""
                                    });
                                }}
                                className="mt-5 font-semibold text-primary-600 hover:underline"
                            >
                                Clear all filters
                            </button>

                        </div>
                    ) : (
                        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-2">
                            {filteredAccommodations.map((item) => (
                                <AccommodationCard
                                    key={item._id}
                                    accommodation={item}
                                />
                            ))}
                        </div>
                    )}

                </section>

            </div>

        </div>
    );
}