import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Eye, EyeOff, Loader2, Lock, ShieldCheck } from "lucide-react";

import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import PasswordStrength from "../components/PasswordStrength";
import { passwordRules } from "../data/passwordRules";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

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

  const toggle = (key) => setShow((s) => ({ ...s, [key]: !s[key] }));

  const eyeButton = (key) => (
    <button
      type="button"
      onClick={() => toggle(key)}
      className="text-muted transition-colors hover:text-primary-600"
    >
      {show[key] ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
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
      // The JWT is attached automatically by the axios interceptor
      await api.put("/users/change-password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      toast.success("Password changed successfully");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setTimeout(() => navigate("/home"), 900);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not change password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Keep your nest"
      highlight="safe and sound."
      text="Update your password regularly to keep your UniNest account secure."
      footerText="Use a unique password that you don't use on any other website."
    >
      <motion.form
        variants={container}
        initial="hidden"
        animate="show"
        onSubmit={handleSubmit}
        noValidate
        className="space-y-5"
      >
        <motion.div variants={item}>
          <motion.div
            animate={{ scale: [1, 1.08, 1] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"
          >
            <ShieldCheck size={28} />
          </motion.div>
          <h1 className="text-3xl font-extrabold text-ink">Change password</h1>
          <p className="mt-1 text-sm text-muted">
            Enter your current password, then choose a new one.
          </p>
        </motion.div>

        <motion.div variants={item}>
          <FormInput
            icon={Lock}
            label="Current password"
            type={show.current ? "text" : "password"}
            name="currentPassword"
            value={form.currentPassword}
            onChange={handleChange}
            placeholder="Your current password"
            autoComplete="current-password"
            error={errors.currentPassword}
            right={eyeButton("current")}
          />
        </motion.div>

        <motion.div variants={item}>
          <FormInput
            icon={Lock}
            label="New password"
            type={show.new ? "text" : "password"}
            name="newPassword"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Create a strong password"
            autoComplete="new-password"
            error={errors.newPassword}
            right={eyeButton("new")}
          />
          <PasswordStrength password={form.newPassword} />
        </motion.div>

        <motion.div variants={item}>
          <FormInput
            icon={Lock}
            label="Confirm new password"
            type={show.confirm ? "text" : "password"}
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter new password"
            autoComplete="new-password"
            error={errors.confirmPassword}
            right={eyeButton("confirm")}
          />
        </motion.div>

        <motion.div variants={item}>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
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
        </motion.div>

        <motion.div variants={item}>
          <Link
            to="/home"
            className="flex items-center justify-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700"
          >
            <ArrowLeft size={16} /> Back to home
          </Link>
        </motion.div>
      </motion.form>
    </AuthLayout>
  );
}