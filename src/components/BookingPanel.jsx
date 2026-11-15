import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { BedDouble, CalendarDays, CheckCircle2, Loader2, Phone, Send, Users } from "lucide-react";

import { createBooking } from "../api/bookings";
import FormInput from "./FormInput";
import { getUser } from "../utils/auth";

const todayStr = () => new Date().toLocaleDateString("en-CA"); // YYYY-MM-DD

export default function BookingPanel({ item }) {
  const user = getUser();
  const hasPhone = Boolean(user?.phone?.trim());

  const [form, setForm] = useState({
    moveInDate: "",
    numberOfRooms: "1",
    numberOfStudents: "1",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.moveInDate) e.moveInDate = "Choose your move-in date";
    else if (form.moveInDate < todayStr()) e.moveInDate = "Date cannot be in the past";

    const rooms = Number(form.numberOfRooms);
    if (!Number.isInteger(rooms) || rooms < 1) e.numberOfRooms = "At least 1 room";
    else if (rooms > item.availableRooms) e.numberOfRooms = `Only ${item.availableRooms} available`;

    const students = Number(form.numberOfStudents);
    if (!Number.isInteger(students) || students < 1) e.numberOfStudents = "At least 1 student";

    if (form.message.length > 500) e.message = "Maximum 500 characters";
    return e;
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      await createBooking({
        accommodation: item._id,
        moveInDate: form.moveInDate,
        numberOfRooms: Number(form.numberOfRooms),
        numberOfStudents: Number(form.numberOfStudents),
        message: form.message.trim(),
      });
      toast.success("Booking request sent!");
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send booking request");
    } finally {
      setLoading(false);
    }
  };

  const box = "mt-6 border-t border-border pt-6";

  if (!item.isAvailable || item.availableRooms < 1) {
    return (
      <div className={box}>
        <p className="rounded-xl bg-slate-50 p-4 text-center text-sm font-semibold text-muted">
          No rooms are available right now.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className={`${box} text-center`}>
        <CheckCircle2 size={40} className="mx-auto text-success" />
        <p className="mt-2 font-extrabold text-ink">Request sent</p>
        <p className="mt-1 text-sm text-muted">The admin will review your booking soon.</p>
        <Link
          to="/my-bookings"
          className="mt-4 inline-block rounded-xl bg-primary-50 px-5 py-2.5 text-sm font-bold text-primary-700 hover:bg-primary-100"
        >
          View my bookings
        </Link>
      </div>
    );
  }

  if (!hasPhone) {
    return (
      <div className={box}>
        <div className="rounded-xl bg-warning/10 p-4">
          <p className="flex items-center gap-2 text-sm font-bold text-ink">
            <Phone size={16} /> Add your phone number first
          </p>
          <p className="mt-1 text-xs text-muted">
            We need a phone number on your profile so the owner can contact you.
          </p>
          <Link to="/profile" className="mt-3 inline-block text-sm font-bold text-primary-600">
            Go to profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className={`${box} space-y-4`}>
      <h2 className="font-extrabold text-ink">Request a booking</h2>

      <FormInput
        icon={CalendarDays}
        label="Move-in date"
        type="date"
        name="moveInDate"
        min={todayStr()}
        value={form.moveInDate}
        onChange={handleChange}
        error={errors.moveInDate}
      />

      <div className="grid grid-cols-2 gap-3">
        <FormInput
          icon={BedDouble}
          label="Rooms"
          type="number"
          min="1"
          max={item.availableRooms}
          name="numberOfRooms"
          value={form.numberOfRooms}
          onChange={handleChange}
          error={errors.numberOfRooms}
        />
        <FormInput
          icon={Users}
          label="Students"
          type="number"
          min="1"
          name="numberOfStudents"
          value={form.numberOfStudents}
          onChange={handleChange}
          error={errors.numberOfStudents}
        />
      </div>

      <div>
        <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-ink">
          <span>Message</span>
          <span className="text-[11px] font-medium text-muted">{form.message.length}/500</span>
        </label>
        <textarea
          name="message"
          value={form.message}
          onChange={handleChange}
          rows={3}
          placeholder="Anything the owner should know (optional)"
          className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink outline-none transition-all placeholder:text-slate-400 ${
            errors.message
              ? "border-danger ring-4 ring-danger/10"
              : "border-border hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
          }`}
        />
        {errors.message && <p className="mt-1.5 text-xs font-medium text-danger">{errors.message}</p>}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-primary-700 disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" /> Sending...
          </>
        ) : (
          <>
            <Send size={18} /> Send booking request
          </>
        )}
      </button>
      <p className="text-center text-xs text-muted">
        Rooms are reserved only after the admin confirms.
      </p>
    </form>
  );
}