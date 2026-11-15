import { CONTACT_STATUS_STYLES } from "../data/contactOptions";

export default function ContactStatusBadge({ status }) {
  return (
    <span
      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
        CONTACT_STATUS_STYLES[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}