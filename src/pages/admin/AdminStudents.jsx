import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Ban,
  Loader2,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Users,
} from "lucide-react";

import { getAllStudents, toggleBlockUser } from "../../api/users";
import Avatar from "../../components/Avatar";
import Modal from "../../components/Modal";
import { formatDate } from "../../utils/format";

const TABS = ["All", "Active", "Blocked"];

export default function AdminStudents() {
  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState(null); // student waiting for confirmation
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllStudents()
      .then((data) => {
        if (!cancelled) setState({ loading: false, items: data.students || [], error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            loading: false,
            items: [],
            error: err.response?.data?.message || "Could not load students",
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

  const counts = useMemo(() => {
    const blocked = items.filter((s) => s.isBlocked).length;
    return { All: items.length, Active: items.length - blocked, Blocked: blocked };
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((s) => {
      if (tab === "Active" && s.isBlocked) return false;
      if (tab === "Blocked" && !s.isBlocked) return false;
      if (!q) return true;
      return [s.firstName, s.lastName, s.email, s.phone, s.university]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, tab, search]);

  const confirmToggle = async () => {
    const student = target;
    const wantBlocked = !student.isBlocked;

    try {
      setSaving(true);
      const data = await toggleBlockUser(student.email);

      // The backend toggles, so trust its answer instead of our guess
      setState((s) => ({
        ...s,
        items: s.items.map((x) => (x._id === student._id ? { ...x, isBlocked: data.isBlocked } : x)),
      }));

      if (data.isBlocked !== wantBlocked) {
        toast("Someone else had already changed this account. The list now shows its current status.");
      } else {
        toast.success(data.isBlocked ? "Student blocked" : "Student unblocked");
      }
      setTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not update this account");
      setTarget(null);
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
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Students</h1>
        <p className="mt-1 text-sm text-muted">
          View student accounts and block or unblock access.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total students", value: counts.All, Icon: Users, tone: "bg-primary-50 text-primary-600" },
          { label: "Active", value: counts.Active, Icon: ShieldCheck, tone: "bg-success/10 text-success" },
          { label: "Blocked", value: counts.Blocked, Icon: Ban, tone: "bg-danger/10 text-danger" },
        ].map(({ label, value, Icon, tone }) => (
          <div key={label} className="rounded-2xl border border-border bg-white p-4 sm:p-5">
            <div className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-extrabold text-ink">{loading ? "–" : value}</p>
            <p className="text-xs text-muted sm:text-sm">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition-colors ${
              tab === t
                ? "bg-primary-600 text-white"
                : "bg-white text-muted hover:bg-primary-50 hover:text-primary-700"
            }`}
          >
            {t} <span className="opacity-70">({counts[t]})</span>
          </button>
        ))}
      </div>

      <div className="flex items-center rounded-xl border border-border bg-white focus-within:border-primary-500 focus-within:ring-4 focus-within:ring-primary-500/15">
        <Search size={18} className="ml-3.5 shrink-0 text-muted" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, phone or university..."
          className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
        />
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
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-16 animate-pulse rounded-xl bg-slate-200" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-white p-12 text-center">
          <Users size={40} className="mx-auto text-primary-300" />
          <p className="mt-3 font-bold text-ink">
            {items.length === 0 ? "No students have registered yet" : "No students match your filters"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">Student</th>
                <th className="px-4 py-3 font-bold">Phone</th>
                <th className="px-4 py-3 font-bold">University</th>
                <th className="px-4 py-3 font-bold">Joined</th>
                <th className="px-4 py-3 font-bold">Last login</th>
                <th className="px-4 py-3 font-bold">Status</th>
                <th className="px-4 py-3 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((s) => (
                <tr key={s._id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={`${s.firstName} ${s.lastName}`} size={38} />
                      <div className="min-w-0">
                        <p className="truncate font-bold text-ink">
                          {s.firstName} {s.lastName}
                        </p>
                        <p className="truncate text-xs text-muted">{s.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink">{s.phone || <span className="text-muted">–</span>}</td>
                  <td className="max-w-[200px] truncate px-4 py-3 text-ink">
                    {s.university || <span className="text-muted">–</span>}
                  </td>
                  <td className="px-4 py-3 text-ink">{formatDate(s.createdAt)}</td>
                  <td className="px-4 py-3 text-ink">
                    {s.lastLogin ? formatDate(s.lastLogin) : <span className="text-muted">Never</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                        s.isBlocked ? "bg-danger/10 text-danger" : "bg-success/10 text-success"
                      }`}
                    >
                      {s.isBlocked ? "Blocked" : "Active"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setTarget(s)}
                      className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${
                        s.isBlocked
                          ? "bg-success/10 text-success hover:bg-success/20"
                          : "bg-danger/10 text-danger hover:bg-danger/20"
                      }`}
                    >
                      {s.isBlocked ? (
                        <>
                          <UserCheck size={15} /> Unblock
                        </>
                      ) : (
                        <>
                          <Ban size={15} /> Block
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {target && (
        <Modal onClose={() => !saving && setTarget(null)} maxWidth="max-w-sm">
          <div
            className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${
              target.isBlocked ? "bg-success/10 text-success" : "bg-danger/10 text-danger"
            }`}
          >
            {target.isBlocked ? <ShieldCheck size={22} /> : <ShieldAlert size={22} />}
          </div>
          <h3 className="text-lg font-extrabold text-ink">
            {target.isBlocked ? "Unblock" : "Block"} {target.firstName} {target.lastName}?
          </h3>
          <p className="mt-1 text-sm text-muted">
            {target.isBlocked
              ? "They will be able to log in to UniNest again."
              : "They will not be able to log in. Anyone already logged in stays signed in until their session expires."}
          </p>
          <p className="mt-2 truncate text-xs font-semibold text-ink">{target.email}</p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setTarget(null)}
              disabled={saving}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmToggle}
              disabled={saving}
              className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white disabled:opacity-70 ${
                target.isBlocked ? "bg-success hover:bg-success/90" : "bg-danger hover:bg-danger/90"
              }`}
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : target.isBlocked ? (
                "Unblock"
              ) : (
                "Block"
              )}
            </button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}