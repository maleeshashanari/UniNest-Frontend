import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";

import api from "../api/axios";
import FormInput from "../components/FormInput";
import PasswordStrength from "../components/PasswordStrength";
import { passwordRules } from "../data/passwordRules";

export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const eyeButton = (key) => (
    <button
      type="button"
      onClick={() => setShow((s) => ({ ...s, [key]: !s[key] }))}
      className="text-muted transition-colors hover:text-primary-600"
    >
      {show[key] ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errs = {};
    if (!form.currentPassword) errs.currentPassword = "Current password is required";
    if (!form.newPassword) errs.newPassword = "New password is required";
    else if (passwordRules.some((r) => !r.test(form.newPassword)))
      errs.newPassword = "Password does not meet all requirements";
    else if (form.newPassword === form.currentPassword)
      errs.newPassword = "New password must be different from the current one";
    if (!form.confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (form.newPassword !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      // Backend expects exactly these two fields
      await api.put("/users/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate("/home"), 800);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not change password";
      toast.error(msg);
      if (/current password is incorrect/i.test(msg))
        setErrors({ currentPassword: "Current password is incorrect" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="mx-auto max-w-md"
    >
      <div className="rounded-3xl border border-border bg-white p-6 shadow-sm sm:p-9">
        <div className="mb-6">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
            <ShieldCheck size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-ink">Change password</h1>
          <p className="mt-1 text-sm text-muted">
            Enter your current password, then choose a new one.
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5">
          <FormInput
            icon={Lock}
            label="Current password"
            type={show.current ? "text" : "password"}
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            autoComplete="current-password"
            error={errors.currentPassword}
            right={eyeButton("current")}
          />

          <div>
            <FormInput
              icon={Lock}
              label="New password"
              type={show.new ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              autoComplete="new-password"
              error={errors.newPassword}
              right={eyeButton("new")}
            />
            <PasswordStrength password={form.newPassword} />
          </div>

          <FormInput
            icon={Lock}
            label="Confirm new password"
            type={show.confirm ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            error={errors.confirmPassword}
            right={eyeButton("confirm")}
          />

          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Updating...
              </>
            ) : (
              "Update password"
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}