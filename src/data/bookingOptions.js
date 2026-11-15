export const BOOKING_STATUSES = [
  "Pending",
  "Confirmed",
  "Occupied",
  "Completed",
  "Rejected",
  "Cancelled",
];

export const STATUS_STYLES = {
  Pending: "bg-warning/10 text-warning",
  Confirmed: "bg-primary-50 text-primary-700",
  Occupied: "bg-success/10 text-success",
  Completed: "bg-slate-100 text-slate-600",
  Rejected: "bg-danger/10 text-danger",
  Cancelled: "bg-slate-100 text-slate-500",
};

// What the student sees under each status
export const STATUS_HINTS = {
  Pending: "Waiting for admin approval.",
  Confirmed: "Approved! Your room is reserved.",
  Occupied: "You are currently staying here.",
  Completed: "Your stay has ended.",
  Rejected: "The admin could not accept this request.",
  Cancelled: "This booking was cancelled.",
};

// Next steps the admin can take (matches your backend's allowedTransitions)
export const ADMIN_ACTIONS = {
  Pending: [
    { to: "Confirmed", label: "Confirm", tone: "bg-success text-white hover:bg-success/90", hint: "Rooms will be deducted from the available count." },
    { to: "Rejected", label: "Reject", tone: "bg-danger/10 text-danger hover:bg-danger/20", hint: "The student will see this booking as rejected." },
    { to: "Cancelled", label: "Cancel", tone: "bg-slate-100 text-slate-600 hover:bg-slate-200", hint: "The booking will be cancelled." },
  ],
  Confirmed: [
    { to: "Occupied", label: "Mark occupied", tone: "bg-primary-600 text-white hover:bg-primary-700", hint: "Use this when the student has moved in." },
    { to: "Cancelled", label: "Cancel", tone: "bg-slate-100 text-slate-600 hover:bg-slate-200", hint: "The reserved rooms will be returned to the available count." },
  ],
  Occupied: [
    { to: "Completed", label: "Mark completed", tone: "bg-primary-600 text-white hover:bg-primary-700", hint: "Use this when the student has left. Rooms will be returned." },
  ],
};