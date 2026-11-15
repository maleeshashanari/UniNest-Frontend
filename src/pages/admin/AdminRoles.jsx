import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCog,
  Users,
} from "lucide-react";

import { changeUserRole, getAllUsers } from "../../api/users";
import Avatar from "../../components/Avatar";
import Modal from "../../components/Modal";
import { getUser } from "../../utils/auth";
import { formatDate } from "../../utils/format";

const TABS = ["All", "Students", "Admins"];

export default function AdminRoles() {
  const myEmail = (getUser()?.email || "").toLowerCase();

  const [state, setState] = useState({ loading: true, items: [], error: "" });
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState("All");
  const [search, setSearch] = useState("");
  const [target, setTarget] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getAllUsers()
      .then((data) => {
        if (!cancelled) setState({ loading: false, items: data.users || [], error: "" });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            loading: false,
            items: [],
            error: err.response?.data?.message || "Could not load users",
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
    const admins = items.filter((u) => u.role === "admin").length;
    return { All: items.length, Admins: admins, Students: items.length - admins };
  }, [items]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((u) => {
      if (tab === "Students" && u.role !== "student") return false;
      if (tab === "Admins" && u.role !== "admin") return false;
      if (!q) return true;
      return [u.firstName, u.lastName, u.email, u.phone, u.university]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [items, tab, search]);

  const confirmChange = async () => {
    const user = target;
    const wantRole = user.role === "admin" ? "student" : "admin";

    try {
      setSaving(true);
      const data = await changeUserRole(user.email);

      // The backend toggles, so trust its answer
      setState((s) => ({
        ...s,
        items: s.items.map((x) => (x._id === user._id ? { ...x, role: data.user.role } : x)),
      }));

      if (data.user.role !== wantRole) {
        toast("Someone else had already changed this role. The list shows the current role.");
      } else {
        toast.success(
          data.user.role === "admin" ? "Promoted to admin" : "Demoted to student"
        );
      }
      setTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change the role");
      setTarget(null);
      retry(); // refresh in case the list is out of date
    } finally {
      setSaving(false);
    }
  };

  const promoting = target?.role !== "admin";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <div>
        <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Roles</h1>
        <p className="mt-1 text-sm text-muted">Promote students to admin or demote admins.</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "All users", value: counts.All, Icon: Users, tone: "bg-primary-50 text-primary-600" },
          { label: "Students", value: counts.Students, Icon: Users, tone: "bg-success/10 text-success" },
          { label: "Admins", value: counts.Admins, Icon: ShieldCheck, tone: "bg-accent-50 text-accent-600" },
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
          <UserCog size={40} className="mx-auto text-primary-300" />
          <p className="mt-3 font-bold text-ink">No users match your filters</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-bold">User</th>
                <th className="px-4 py-3 font-bold">University</th>
                <th className="px-4 py-3 font-bold">Joined</th>
                <th className="px-4 py-3 font-bold">Role</th>
                <th className="px-4 py-3 text-right font-bold">Action</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((u) => {
                const isMe = u.email.toLowerCase() === myEmail;
                const isAdmin = u.role === "admin";
                const lastAdmin = isAdmin && counts.Admins <= 1;
                const disabled = isMe || lastAdmin;

                return (
                  <tr key={u._id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={`${u.firstName} ${u.lastName}`} size={38} />
                        <div className="min-w-0">
                          <p className="truncate font-bold text-ink">
                            {u.firstName} {u.lastName}
                            {isMe && (
                              <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-muted">
                                You
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-muted">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-ink">
                      {u.university || <span className="text-muted">–</span>}
                    </td>
                    <td className="px-4 py-3 text-ink">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                          isAdmin ? "bg-accent-50 text-accent-600" : "bg-primary-50 text-primary-700"
                        }`}
                      >
                        {isAdmin ? "Admin" : "Student"}
                      </span>
                      {u.isBlocked && (
                        <span className="ml-2 inline-block rounded-full bg-danger/10 px-3 py-1 text-xs font-bold text-danger">
                          Blocked
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setTarget(u)}
                        disabled={disabled}
                        title={
                          isMe
                            ? "You cannot change your own role"
                            : lastAdmin
                            ? "Cannot demote the last remaining admin"
                            : undefined
                        }
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                          isAdmin
                            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                            : "bg-primary-50 text-primary-700 hover:bg-primary-100"
                        }`}
                      >
                        {isAdmin ? (
                          <>
                            <ArrowDownCircle size={15} /> Demote
                          </>
                        ) : (
                          <>
                            <ArrowUpCircle size={15} /> Make admin
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {target && (
        <Modal onClose={() => !saving && setTarget(null)} maxWidth="max-w-sm">
          <div
            className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl ${
              promoting ? "bg-primary-50 text-primary-600" : "bg-slate-100 text-slate-600"
            }`}
          >
            {promoting ? <ArrowUpCircle size={22} /> : <ArrowDownCircle size={22} />}
          </div>
          <h3 className="text-lg font-extrabold text-ink">
            {promoting ? "Make" : "Demote"} {target.firstName} {target.lastName}{" "}
            {promoting ? "an admin?" : "to student?"}
          </h3>
          <p className="mt-1 text-sm text-muted">
            {promoting
              ? "Admins can manage listings, bookings, reviews, students and roles. Only promote people you trust."
              : "They will lose access to the admin panel and become a normal student."}
          </p>
          <p className="mt-2 truncate text-xs font-semibold text-ink">{target.email}</p>
          <p className="mt-2 text-xs text-muted">
            The change applies fully after they log in again.
          </p>

          <div className="mt-6 flex gap-3">
            <button
              onClick={() => setTarget(null)}
              disabled={saving}
              className="flex-1 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmChange}
              disabled={saving}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-primary-700 disabled:opacity-70"
            >
              {saving ? (
                <Loader2 size={16} className="animate-spin" />
              ) : promoting ? (
                "Make admin"
              ) : (
                "Demote"
              )}
            </button>
          </div>
        </Modal>
      )}
    </motion.div>
  );
}