import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  GraduationCap,
  Inbox,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  Reply,
  Search,
  Trash2,
} from "lucide-react";

import {
  deleteContactMessage,
  getAllContactMessages,
  replyToContactMessage,
  updateContactStatus,
} from "../../api/contact";
import ContactStatusBadge from "../../components/ContactStatusBadge";
import Modal from "../../components/Modal";
import SelectInput from "../../components/SelectInput";
import { CATEGORIES, CONTACT_STATUSES } from "../../data/contactOptions";
import { formatDate } from "../../utils/format";

export default function AdminContacts() {
  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState("All");
  const [category, setCategory] = useState("");
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [modal, setModal] = useState(null); // { type: "reply" | "delete", contact }
  const [reply, setReply] = useState("");
  const [markResolved, setMarkResolved] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllContactMessages()
      .then((data) => {
        if (!cancelled) setState({ loading: false, items: data.contacts || [], error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            loading: false,
            items: [],
            error: err.response?.data?.message || "Could not load messages",
          });
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const { loading, items, error } = state;

  const retry = () => {
    setState((s) => ({ ...s, loading: true, error: "" }));
    setReloadKey((k) => k + 1);
  };

  // Responses are not populated, so keep the student details we already have
  const patchItem = (id, contact) =>
    setState((s) => ({
      ...s,
      items: s.items.map((c) => (c._id === id ? { ...c, ...contact, student: c.student } : c)),
    }));

  const counts = useMemo(() => {
    const c = { All: items.length };
    CONTACT_STATUSES.forEach((s) => (c[s] = items.filter((m) => m.status === s).length));
    return c;
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((c) => {
      if (tab !== "All" && c.status !== tab) return false;
      if (category && c.category !== category) return false;
      if (!q) return true;
      return [c.studentName, c.studentEmail, c.subject, c.message, c.student?.university]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, tab, category, search]);

  const changeStatus = async (contact, status) => {
    if (status === contact.status) return;
    try {
      setBusyId(contact._id);
      const data = await updateContactStatus(contact._id, status);
      patchItem(contact._id, data.contact);
      toast.success(`Marked as ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update status");
    } finally {
      setBusyId(null);
    }
  };

  const openReply = (contact) => {
    setReply(contact.adminReply || "");
    setMarkResolved(contact.status !== "Resolved");
    setModal({ type: "reply", contact });
  };

  const sendReply = async () => {
    const text = reply.trim();
    if (!text) return toast.error("Write a reply first");
    if (text.length > 2000) return toast.error("Reply must not exceed 2000 characters");

    const target = modal.contact;
    try {
      setSaving(true);
      const data = await replyToContactMessage(target._id, text);
      let updated = data.contact;

      if (markResolved && updated.status !== "Resolved") {
        try {
          const s = await updateContactStatus(target._id, "Resolved");
          updated = s.contact;
        } catch {
          toast.error("Reply saved, but it could not be marked as resolved");
        }
      }

      patchItem(target._id, updated);

      // Your backend saves the reply even if the email could not be sent
      if (data.emailSent) toast.success("Reply saved and emailed to the student");
      else toast(data.message, { icon: "⚠️" });

      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not save reply");
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    const target = modal.contact;
    try {
      setSaving(true);
      await deleteContactMessage(target._id);
      setState((s) => ({ ...s, items: s.items.filter((c) => c._id !== target._id) }));
      toast.success("Message deleted");
      setModal(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not delete message");
      setModal(null);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Contact messages</h1>
        <p className="mt-1 text-sm text-muted">
          {counts.Pending > 0
            ? `${counts.Pending} message${counts.Pending > 1 ? "s" : ""} waiting for you`
            : "Read, reply to and resolve student messages."}
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {["All", ...CONTACT_STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === s
                ? "bg-primary-600 text-white"
                : "bg-white text-muted hover:bg-primary-50 hover:text-primary-700"
            }`}
          >
            {s} <span className="opacity-70">({counts[s] ?? 0})</span>
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_220px]">
        <div className="flex items-center rounded-xl border border-border bg-white focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15">
          <Search size={18} className="ml-3.5 shrink-0 text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student, subject or message..."
            className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <SelectInput value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </SelectInput>
      </div>

      {error ? (
        <div className="rounded-2xl border border-danger/20 bg-danger/5 p-8 text-center">
          <p className="font-bold text-danger">{error}</p>
          <button
            onClick={retry}
            className="mt-3 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-bold text-ink shadow-sm"
          >
            <RefreshCw size={16} /> Try again
          </button>
        </div>
      ) : loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Inbox size={40} className="mx-auto text-primary-300" />
          <p className="mt-3 font-bold text-ink">
            {items.length === 0 ? "No messages yet" : "No messages match your filters"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {visible.map((c) => (
            <div key={c._id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-extrabold text-ink">{c.subject}</h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-ink">
                      {c.category}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    From <span className="font-bold text-ink">{c.studentName}</span> ·{" "}
                    {formatDate(c.createdAt)}
                  </p>
                </div>
                <ContactStatusBadge status={c.status} />
              </div>

              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink">
                <a
                  href={`mailto:${c.studentEmail}`}
                  className="flex items-center gap-1.5 hover:text-primary-600"
                >
                  <Mail size={14} className="text-muted" /> {c.studentEmail}
                </a>
                {c.student?.phone && (
                  <a
                    href={`tel:${c.student.phone.replace(/\s/g, "")}`}
                    className="flex items-center gap-1.5 hover:text-primary-600"
                  >
                    <Phone size={14} className="text-muted" /> {c.student.phone}
                  </a>
                )}
                {c.student?.university && (
                  <span className="flex items-center gap-1.5">
                    <GraduationCap size={14} className="text-muted" /> {c.student.university}
                  </span>
                )}
              </div>

              <p className="mt-4 whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm leading-relaxed text-slate-600">
                {c.message}
              </p>

              {c.adminReply && (
                <div className="mt-3 rounded-xl border-l-4 border-primary-500 bg-primary-50/50 p-3">
                  <p className="text-xs font-bold text-primary-700">
                    Your reply{c.repliedAt ? ` · ${formatDate(c.repliedAt)}` : ""}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{c.adminReply}</p>
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
                <button
                  onClick={() => openReply(c)}
                  className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-3 py-2 text-sm font-bold text-white hover:bg-primary-700"
                >
                  <Reply size={15} /> {c.adminReply ? "Edit reply" : "Reply"}
                </button>

                <select
                  value={c.status}
                  disabled={busyId === c._id}
                  onChange={(e) => changeStatus(c, e.target.value)}
                  aria-label="Change status"
                  className="rounded-lg border border-border bg-white px-3 py-2 text-sm font-bold text-ink outline-none hover:border-primary-300 focus:border-primary-500 disabled:opacity-60"
                >
                  {CONTACT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => setModal({ type: "delete", contact: c })}
                  className="ml-auto flex items-center gap-1.5 rounded-lg bg-accent-50 px-3 py-2 text-sm font-bold text-accent-600 hover:bg-accent-100"
                >
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal?.type === "reply" && (
        <Modal onClose={() => !saving && setModal(null)}>
          <h3 className="text-lg font-extrabold text-ink">Reply to {modal.contact.studentName}</h3>
          <p className="mt-1 text-xs text-muted">
            The reply is saved and emailed to {modal.contact.studentEmail}.
          </p>
          <p className="mt-3 max-h-32 overflow-y-auto whitespace-pre-line rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
            {modal.contact.message}
          </p>

          <label className="mb-1.5 mt-5 flex items-center justify-between text-sm font-semibold text-ink">
            <span>Your reply</span>
            <span className="text-[11px] font-medium text-muted">{reply.length}/2000</span>
          </label>
          <textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            rows={5}
            maxLength={2000}
            placeholder="Thank you for contacting UniNest..."
            className="w-full rounded-xl border border-border bg-white px-3.5 py-3 text-sm outline-none placeholder:text-slate-400 hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
          />

          <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-semibold text-ink">
            <input
              type="checkbox"
              checked={markResolved}
              onChange={(e) => setMarkResolved(e.target.checked)}
              className="h-4 w-4 accent-primary-600"
            />
            Mark as resolved after replying
          </label>

          <div className="mt-5 flex gap-3">
            <button
              onClick={() => setModal(null)}
              disabled={saving}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={sendReply}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-70"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Send reply"}
            </button>
          </div>
        </Modal>
      )}

      {modal?.type === "delete" && (
        <Modal onClose={() => !saving && setModal(null)} maxWidth="max-w-sm">
          <h3 className="text-lg font-extrabold text-ink">Delete this message?</h3>
          <p className="mt-1 text-sm text-muted">
            The message from <span className="font-bold text-ink">{modal.contact.studentName}</span>{" "}
            will be permanently removed, and the student will no longer see it.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setModal(null)}
              disabled={saving}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-accent-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-accent-600 disabled:opacity-70"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : "Delete"}
            </button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}