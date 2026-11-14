import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, BedDouble, Users } from "lucide-react";
import toast from "react-hot-toast";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function BookingForm({ accommodation }) {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        moveInDate: "",
        numberOfRooms: 1,
        numberOfStudents: 1,
        message: ""
    });

    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user?.phone) {
            toast.error("Please add your phone number to your profile before booking.");
            navigate("/student/profile");
            return;
        }

        if (!formData.moveInDate) {
            toast.error("Please select your move-in date.");
            return;
        }

        if (Number(formData.numberOfRooms) > Number(accommodation.availableRooms)) {
            toast.error("Not enough rooms are available.");
            return;
        }

        try {
            setSubmitting(true);

            await api.post("/bookings/", {
                accommodation: accommodation._id,
                moveInDate: formData.moveInDate,
                numberOfRooms: Number(formData.numberOfRooms),
                numberOfStudents: Number(formData.numberOfStudents),
                message: formData.message.trim()
            });

            toast.success("Booking request submitted successfully!");
            navigate("/student/bookings");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to submit your booking request."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const today = new Date().toLocaleDateString("en-CA");

    return (
        <div className="rounded-2xl border border-border bg-white p-6">
            <h2 className="mb-2 text-xl font-semibold text-ink">
                Book This Accommodation
            </h2>

            <p className="mb-6 text-sm text-muted">
                Submit a booking request. The accommodation owner or admin
                will review your request.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label
                        htmlFor="moveInDate"
                        className="mb-2 block text-sm font-medium text-ink"
                    >
                        Move-in Date
                    </label>

                    <div className="relative">
                        <CalendarDays
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        />

                        <input
                            id="moveInDate"
                            type="date"
                            name="moveInDate"
                            min={today}
                            value={formData.moveInDate}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-border py-3 pl-10 pr-3 text-ink outline-none focus:border-primary-500"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="numberOfRooms"
                        className="mb-2 block text-sm font-medium text-ink"
                    >
                        Number of Rooms
                    </label>

                    <div className="relative">
                        <BedDouble
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        />

                        <input
                            id="numberOfRooms"
                            type="number"
                            name="numberOfRooms"
                            min="1"
                            max={accommodation.availableRooms}
                            value={formData.numberOfRooms}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-border py-3 pl-10 pr-3 text-ink outline-none focus:border-primary-500"
                        />
                    </div>

                    <p className="mt-1 text-xs text-muted">
                        Available rooms: {accommodation.availableRooms}
                    </p>
                </div>

                <div>
                    <label
                        htmlFor="numberOfStudents"
                        className="mb-2 block text-sm font-medium text-ink"
                    >
                        Number of Students
                    </label>

                    <div className="relative">
                        <Users
                            size={18}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
                        />

                        <input
                            id="numberOfStudents"
                            type="number"
                            name="numberOfStudents"
                            min="1"
                            value={formData.numberOfStudents}
                            onChange={handleChange}
                            required
                            className="w-full rounded-xl border border-border py-3 pl-10 pr-3 text-ink outline-none focus:border-primary-500"
                        />
                    </div>
                </div>

                <div>
                    <label
                        htmlFor="bookingMessage"
                        className="mb-2 block text-sm font-medium text-ink"
                    >
                        Additional Message (Optional)
                    </label>

                    <textarea
                        id="bookingMessage"
                        name="message"
                        rows="3"
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Add any additional information..."
                        className="w-full rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={submitting || !accommodation.availableRooms}
                    className="w-full rounded-xl bg-primary-600 px-5 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {submitting ? "Submitting..." : "Submit Booking Request"}
                </button>
            </form>
        </div>
    );
}