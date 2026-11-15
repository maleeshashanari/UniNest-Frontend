export const CATEGORIES = [
  "General Inquiry",
  "Complaint",
  "Accommodation Issue",
  "Booking Issue",
  "Other",
];

export const CONTACT_STATUSES = ["Pending", "In Progress", "Resolved"];

export const CONTACT_STATUS_STYLES = {
  Pending: "bg-warning/10 text-warning",
  "In Progress": "bg-primary-50 text-primary-700",
  Resolved: "bg-success/10 text-success",
};

// What the student sees when there is no reply yet
export const CONTACT_STATUS_HINTS = {
  Pending: "Waiting for the admin to read your message.",
  "In Progress": "The admin is looking into this.",
  Resolved: "This has been marked as resolved.",
};