import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Inbox, Loader2, RefreshCw, Send, Tag, Type } from "lucide-react";

import { getMyContactMessages, submitContactMessage } from "../api/contact";
import ContactStatusBadge from "../components/ContactStatusBadge";
import FormInput from "../components/FormInput";
import SelectInput from "../components/SelectInput";
import { CATEGORIES, CONTACT_STATUS_HINTS } from "../data/contactOptions";
import { formatDate } from "../utils/format";

const EMPTY = { category: "", subject: "", message: "" };

export default function Contact() {
  const [tab, setTab] = useState("new");
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);

  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    getMyContactMessages()
      .then((data) => {
        if (!cancelled) setState({ loading: false, items: data.contacts || [], error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            loading: false,
            items: [],
            error: err.response?.data?.message || "Could not load your messages",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!form.category) errs.category = "Choose a category";
    if (!form.subject.trim()) errs.subject = "Subject is required";
    else if (form.subject.trim().length > 150) errs.subject = "Maximum 150 characters";
    if (!form.message.trim()) errs.message = "Message is required";
    else if (form.message.trim().length > 2000) errs.message = "Maximum 2000 characters";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setSending(true);
      const data = await submitContactMessage({
        category: form.category,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });

      // Your backend saves the message even if the notification email fails
      if (data.emailSent) toast.success(data.message);
      else toast(data.message, { icon: "⚠️" });

      setState((s) => ({ ...s, items: [data.contact, ...s.items] }));
      setForm(EMPTY);
      setTab("history");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send your message");
    } finally {
      setSending(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-3xl space-y-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Contact us</h1>
        <p className="mt-1 text-sm text-muted">
          Questions, complaints or problems with a stay? Send us a message.
        </p>
      </div>

      <div className="flex gap-2">
        {[
          { id: "new", label: "New message" },
          { id: "history", label: `My messages (${loading ? "…" : items.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === t.id
                ? "bg-primary-600 text-white"
                : "bg-white text-muted hover:bg-primary-50 hover:text-primary-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "new" ? (
        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-5 rounded-3xl border border-border bg-white p-6 sm:p-8"
        >
          <SelectInput
            icon={Tag}
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            error={errors.category}
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectInput>

          <FormInput
            icon={Type}
            label="Subject"
            name="subject"
            maxLength={150}
            value={form.subject}
            onChange={handleChange}
            placeholder="Short summary of your message"
            error={errors.subject}
          />

          <div>
            <label className="mb-1.5 flex items-center justify-between text-sm font-semibold text-ink">
              <span>Message</span>
              <span className="text-[11px] font-medium text-muted">{form.message.length}/2000</span>
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={6}
              maxLength={2000}
              placeholder="Tell us what happened or what you need help with..."
              className={`w-full rounded-xl border bg-white px-3.5 py-3 text-sm text-ink outline-none transition-all placeholder:text-slate-400 ${
                errors.message
                  ? "border-danger ring-4 ring-danger/10"
                  : "border-border hover:border-primary-300 focus:border-primary-500 focus:ring-4 focus:ring-primary-500/15"
              }`}
            />
            {errors.message && (
              <p className="mt-1.5 text-xs font-medium text-danger">{errors.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={sending}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 disabled:opacity-70"
          >
            {sending ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Sending...
              </>
            ) : (
              <>
                <Send size={18} /> Send message
              </>
            )}
          </button>
        </form>
      ) : error ? (
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
            <div key={n} className="h-36 animate-pulse rounded-2xl bg-slate-200" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Inbox size={40} className="mx-auto text-primary-300" />
          <p className="mt-3 font-bold text-ink">No messages yet</p>
          <button
            onClick={() => setTab("new")}
            className="mt-2 text-sm font-bold text-primary-600 hover:text-primary-700"
          >
            Send your first message
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((c) => (
            <div key={c._id} className="rounded-2xl border border-border bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-extrabold text-ink">{c.subject}</h3>
                  <p className="mt-0.5 text-xs text-muted">
                    {c.category} · {formatDate(c.createdAt)}
                  </p>
                </div>
                <ContactStatusBadge status={c.status} />
              </div>

              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-600">
                {c.message}
              </p>

              {c.adminReply ? (
                <div className="mt-4 rounded-xl border-l-4 border-primary-500 bg-slate-50 p-3">
                  <p className="text-xs font-bold text-primary-700">
                    Reply from UniNest{c.repliedAt ? ` · ${formatDate(c.repliedAt)}` : ""}
                  </p>
                  <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{c.adminReply}</p>
                </div>
              ) : (
                <p className="mt-4 text-xs font-semibold text-muted">
                  {CONTACT_STATUS_HINTS[c.status]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}