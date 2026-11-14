import { useEffect, useState } from "react";
import { CalendarDays, MapPin, BedDouble, Users } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

export default function StudentBookings() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        let isMounted = true;

        const loadBookings = async () => {
            try {
                const response = await api.get("/bookings/my");

                if (isMounted) {
                    setBookings(response.data.bookings || []);
                }
            } catch (error) {
                if (isMounted) {
                    toast.error(
                        error.response?.data?.message ||
                        "Unable to load your bookings."
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadBookings();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleCancel = async (bookingId) => {
        const confirmed = window.confirm(
            "Are you sure you want to cancel this booking?"
        );

        if (!confirmed) return;

        try {
            setCancellingId(bookingId);

            await api.put(`/bookings/my/${bookingId}/cancel`);

            setBookings((previous) =>
                previous.map((booking) =>
                    booking._id === bookingId
                        ? { ...booking, status: "Cancelled" }
                        : booking
                )
            );

            toast.success("Booking cancelled successfully.");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to cancel this booking."
            );
        } finally {
            setCancellingId(null);
        }
    };

    const getStatusStyle = (status) => {
        const styles = {
            Pending: "bg-yellow-100 text-yellow-700",
            Confirmed: "bg-green-100 text-green-700",
            Rejected: "bg-red-100 text-red-700",
            Cancelled: "bg-gray-100 text-gray-700",
            Occupied: "bg-blue-100 text-blue-700",
            Completed: "bg-purple-100 text-purple-700"
        };

        return styles[status] || "bg-gray-100 text-gray-700";
    };

    const formatDate = (date) => {
        if (!date) return "Not specified";

        return new Date(date).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric"
        });
    };

    if (loading) {
        return (
            <div className="py-12 text-center text-muted">
                Loading your bookings...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-ink">
                    My Bookings
                </h1>
                <p className="mt-1 text-muted">
                    View and manage your accommodation booking requests.
                </p>
            </div>

            {bookings.length === 0 ? (
                <div className="rounded-2xl border border-border bg-white p-10 text-center">
                    <CalendarDays
                        size={40}
                        className="mx-auto mb-3 text-muted"
                    />
                    <h2 className="text-lg font-semibold text-ink">
                        No bookings yet
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                        Your accommodation booking requests will appear here.
                    </p>
                </div>
            ) : (
                <div className="space-y-5">
                    {bookings.map((booking) => {
                        const accommodation =
                            typeof booking.accommodation === "object"
                                ? booking.accommodation
                                : null;

                        return (
                            <div
                                key={booking._id}
                                className="rounded-2xl border border-border bg-white p-5"
                            >
                                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                    <div>
                                        <h2 className="text-lg font-semibold text-ink">
                                            {accommodation?.title ||
                                                "Accommodation"}
                                        </h2>

                                        <p className="mt-1 text-sm text-muted">
                                            Booking ID: {booking._id}
                                        </p>
                                    </div>

                                    <span
                                        className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(booking.status)}`}
                                    >
                                        {booking.status || "Pending"}
                                    </span>
                                </div>

                                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                                    <div className="flex items-center gap-3 text-sm text-muted">
                                        <MapPin size={18} />
                                        <span>
                                            {accommodation?.location?.city ||
                                                accommodation?.location?.address ||
                                                "Location not available"}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-muted">
                                        <CalendarDays size={18} />
                                        <span>
                                            Move-in: {formatDate(booking.moveInDate)}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-muted">
                                        <BedDouble size={18} />
                                        <span>
                                            {booking.numberOfRooms} Room(s)
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3 text-sm text-muted">
                                        <Users size={18} />
                                        <span>
                                            {booking.numberOfStudents} Student(s)
                                        </span>
                                    </div>
                                </div>

                                {booking.message && (
                                    <div className="mt-4 rounded-xl bg-background p-3">
                                        <p className="text-sm font-medium text-ink">
                                            Your Message
                                        </p>
                                        <p className="mt-1 text-sm text-muted">
                                            {booking.message}
                                        </p>
                                    </div>
                                )}

                                {booking.adminNote && (
                                    <div className="mt-4 rounded-xl bg-background p-3">
                                        <p className="text-sm font-medium text-ink">
                                            Admin Note
                                        </p>
                                        <p className="mt-1 text-sm text-muted">
                                            {booking.adminNote}
                                        </p>
                                    </div>
                                )}

                                {booking.status === "Pending" && (
                                    <div className="mt-5 border-t border-border pt-4">
                                        <button
                                            type="button"
                                            onClick={() => handleCancel(booking._id)}
                                            disabled={cancellingId === booking._id}
                                            className="rounded-xl border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-60"
                                        >
                                            {cancellingId === booking._id
                                                ? "Cancelling..."
                                                : "Cancel Booking"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}