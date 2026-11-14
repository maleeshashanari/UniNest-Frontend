import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
    MapPin,
    BedDouble,
    Users,
    Phone,
    GraduationCap,
    ArrowLeft,
    CheckCircle,
    Home,
    Wallet
} from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import ReviewSection from "../../components/ReviewSection";
import BookingForm from "../../components/BookingForm";

export default function AccommodationDetails() {
    const { id } = useParams();

    const [accommodation, setAccommodation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImage, setActiveImage] = useState(0);

    useEffect(() => {
        const fetchAccommodation = async () => {
            try {
                const response = await api.get(`/accommodations/${id}`);

                setAccommodation(
                    response.data.accommodation || response.data
                );

            } catch (error) {
                toast.error(
                    error.response?.data?.message ||
                    "Unable to load accommodation details."
                );
            } finally {
                setLoading(false);
            }
        };

        fetchAccommodation();
    }, [id]);

    if (loading) {
        return (
            <div className="py-20 text-center text-muted">
                Loading accommodation details...
            </div>
        );
    }

    if (!accommodation) {
        return (
            <div className="py-20 text-center">

                <h2 className="text-xl font-bold text-ink">
                    Accommodation not found
                </h2>

                <Link
                    to="/student/accommodations"
                    className="mt-4 inline-block font-semibold text-primary-600 hover:underline"
                >
                    Back to accommodations
                </Link>

            </div>
        );
    }

    const images =
        accommodation.images?.length > 0
            ? accommodation.images
            : ["/images/default-accommodation.png"];

    const location = accommodation.location || {};

    return (
        <div className="mx-auto max-w-6xl space-y-8">

            <Link
                to="/student/accommodations"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:underline"
            >
                <ArrowLeft size={17} />
                Back to Accommodations
            </Link>

            <section className="overflow-hidden rounded-2xl border border-border bg-white">

                <div className="grid gap-2 bg-gray-100 md:grid-cols-[2fr_1fr]">

                    <div className="h-72 overflow-hidden md:h-[420px]">
                        <img
                            src={images[activeImage]}
                            alt={accommodation.title}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.src = "/images/default-accommodation.png";
                            }}
                        />
                    </div>

                    <div className="hidden gap-2 p-2 md:grid md:grid-rows-2">

                        {images.slice(0, 2).map((image, index) => (
                            <button
                                key={`${image}-${index}`}
                                type="button"
                                onClick={() => setActiveImage(index)}
                                className={`overflow-hidden rounded-lg ${
                                    activeImage === index
                                        ? "ring-2 ring-primary-600"
                                        : ""
                                }`}
                            >
                                <img
                                    src={image}
                                    alt={`Accommodation ${index + 1}`}
                                    className="h-full w-full object-cover"
                                    onError={(e) => {
                                        e.currentTarget.src = "/images/default-accommodation.png";
                                    }}
                                />
                            </button>
                        ))}

                    </div>

                </div>

                {images.length > 1 && (
                    <div className="flex gap-3 overflow-x-auto p-4 md:hidden">

                        {images.map((image, index) => (
                            <button
                                key={`${image}-${index}`}
                                type="button"
                                onClick={() => setActiveImage(index)}
                                className={`h-20 w-24 shrink-0 overflow-hidden rounded-lg ${
                                    activeImage === index
                                        ? "ring-2 ring-primary-600"
                                        : ""
                                }`}
                            >
                                <img
                                    src={image}
                                    alt={`Accommodation ${index + 1}`}
                                    className="h-full w-full object-cover"
                                />
                            </button>
                        ))}

                    </div>
                )}

                <div className="p-6 sm:p-8">

                    <div className="flex flex-col justify-between gap-5 sm:flex-row">

                        <div>
                            <div className="mb-3 flex flex-wrap gap-2">

                                <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700">
                                    {accommodation.type}
                                </span>

                                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                                    {accommodation.isAvailable
                                        ? "Available"
                                        : "Not Available"}
                                </span>

                            </div>

                            <h1 className="text-2xl font-bold text-ink sm:text-3xl">
                                {accommodation.title}
                            </h1>

                            <p className="mt-3 flex items-center gap-2 text-sm text-muted">
                                <MapPin size={18} />
                                {[location.address, location.city, location.district]
                                    .filter(Boolean)
                                    .join(", ") || "Location not specified"}
                            </p>

                        </div>

                        <div className="rounded-xl bg-primary-50 p-5 sm:min-w-52">
                            <p className="text-sm text-muted">
                                Monthly Rent
                            </p>

                            <p className="mt-1 text-2xl font-bold text-primary-700">
                                Rs. {Number(accommodation.monthlyRent || 0).toLocaleString()}
                            </p>
                        </div>

                    </div>

                    <div className="my-7 grid gap-4 border-y border-border py-6 sm:grid-cols-2 lg:grid-cols-4">

                        <div className="flex items-center gap-3">
                            <Home className="text-primary-600" size={22} />
                            <div>
                                <p className="text-xs text-muted">Accommodation</p>
                                <p className="font-semibold text-ink">{accommodation.type}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <BedDouble className="text-primary-600" size={22} />
                            <div>
                                <p className="text-xs text-muted">Available Rooms</p>
                                <p className="font-semibold text-ink">{accommodation.availableRooms}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <Users className="text-primary-600" size={22} />
                            <div>
                                <p className="text-xs text-muted">Suitable For</p>
                                <p className="font-semibold text-ink">{accommodation.suitableFor}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <GraduationCap className="text-primary-600" size={22} />
                            <div>
                                <p className="text-xs text-muted">University</p>
                                <p className="font-semibold text-ink">{accommodation.university || "Any university"}</p>
                            </div>
                        </div>

                    </div>

                    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">

                        <div className="space-y-7">

                            <div>
                                <h2 className="text-lg font-bold text-ink">
                                    Description
                                </h2>

                                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-muted">
                                    {accommodation.description || "No description provided."}
                                </p>
                            </div>

                            <div>
                                <h2 className="text-lg font-bold text-ink">
                                    Amenities
                                </h2>

                                {accommodation.amenities?.length > 0 ? (
                                    <div className="mt-4 grid gap-3 sm:grid-cols-2">

                                        {accommodation.amenities.map((amenity, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 text-sm text-muted"
                                            >
                                                <CheckCircle
                                                    size={17}
                                                    className="text-green-600"
                                                />
                                                {amenity}
                                            </div>
                                        ))}

                                    </div>
                                ) : (
                                    <p className="mt-3 text-sm text-muted">
                                        No amenities listed.
                                    </p>
                                )}
                            </div>

                        </div>

                        <div className="h-fit rounded-2xl border border-border p-5">

                            <h3 className="font-bold text-ink">
                                Accommodation Information
                            </h3>

                            <div className="mt-5 space-y-4 text-sm">

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted">Security Deposit</span>
                                    <span className="font-semibold text-ink">
                                        Rs. {Number(accommodation.securityDeposit || 0).toLocaleString()}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted">Total Rooms</span>
                                    <span className="font-semibold text-ink">
                                        {accommodation.totalRooms ?? "N/A"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted">Available Rooms</span>
                                    <span className="font-semibold text-ink">
                                        {accommodation.availableRooms ?? "N/A"}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between gap-3">
                                    <span className="text-muted">Gender Suitability</span>
                                    <span className="font-semibold text-ink">
                                        {accommodation.suitableFor}
                                    </span>
                                </div>

                            </div>

                            <div className="my-5 border-t border-border" />

                            <a
                                href={`tel:${accommodation.contactNumber}`}
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700"
                            >
                                <Phone size={17} />
                                Contact Provider
                            </a>

                            <p className="mt-3 text-center text-xs text-muted">
                                {accommodation.contactNumber || "Contact number not available"}
                            </p>

                            <div className="mt-5 flex items-center gap-2 text-xs text-muted">
                                <Wallet size={16} />
                                Monthly rent and security deposit are shown above.
                            </div>

                        </div>

                    </div>

                </div>

            </section>
            
            <BookingForm accommodation={accommodation} />

            <ReviewSection accommodationId={accommodation._id} />

        </div>
    );
}