import { SlidersHorizontal, RotateCcw } from "lucide-react";

export default function AccommodationFilters({ filters, setFilters }) {
    const updateFilter = (name, value) => {
        setFilters((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const resetFilters = () => {
        setFilters({
            type: "",
            suitableFor: "",
            maxRent: ""
        });
    };

    return (
        <div className="rounded-2xl border border-border bg-white p-5">

            <div className="mb-5 flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-semibold text-ink">
                    <SlidersHorizontal size={19} />
                    Filters
                </h3>

                <button
                    onClick={resetFilters}
                    className="flex items-center gap-1 text-sm text-primary-600 hover:underline"
                >
                    <RotateCcw size={14} />
                    Reset
                </button>
            </div>

            <div className="space-y-5">

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        Accommodation Type
                    </label>

                    <select
                        value={filters.type}
                        onChange={(e) => updateFilter("type", e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-3 text-sm outline-none focus:border-primary-600"
                    >
                        <option value="">All Types</option>
                        <option value="Hostel">Hostel</option>
                        <option value="Boarding">Boarding</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Annex">Annex</option>
                        <option value="House">House</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        Suitable For
                    </label>

                    <select
                        value={filters.suitableFor}
                        onChange={(e) => updateFilter("suitableFor", e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-3 text-sm outline-none focus:border-primary-600"
                    >
                        <option value="">Everyone</option>
                        <option value="Boys">Boys</option>
                        <option value="Girls">Girls</option>
                        <option value="Any">Anyone</option>
                    </select>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        Maximum Monthly Rent
                    </label>

                    <select
                        value={filters.maxRent}
                        onChange={(e) => updateFilter("maxRent", e.target.value)}
                        className="w-full rounded-lg border border-border bg-white px-3 py-3 text-sm outline-none focus:border-primary-600"
                    >
                        <option value="">Any Budget</option>
                        <option value="10000">Up to Rs. 10,000</option>
                        <option value="20000">Up to Rs. 20,000</option>
                        <option value="30000">Up to Rs. 30,000</option>
                        <option value="50000">Up to Rs. 50,000</option>
                        <option value="75000">Up to Rs. 75,000</option>
                        <option value="100000">Up to Rs. 100,000</option>
                    </select>
                </div>

            </div>

        </div>
    );
}