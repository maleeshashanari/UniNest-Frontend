import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  MailCheck,
} from "lucide-react";

import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import OtpInput from "../components/OtpInput";
import PasswordStrength from "../components/PasswordStrength";
import { passwordRules } from "../data/passwordRules";

const slide = {
  initial: { opacity: 0, x: 40 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -40 },
  transition: { duration: 0.3 },
};

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Resend countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ---------- Step 1: send OTP ----------
  const sendOtp = async (e) => {
    e?.preventDefault();

    const clean = email.trim().toLowerCase();
    if (!clean) return setErrors({ email: "Email is required" });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean))
      return setErrors({ email: "Invalid email format" });

    try {
      setLoading(true);
      setErrors({});
      await api.post("/users/send-otp", { email: clean });
      toast.success("OTP sent! Check your email.");
      setCooldown(30);
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not send OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (cooldown > 0) return;
    try {
      setLoading(true);
      await api.post("/users/send-otp", { email: email.trim().toLowerCase() });
      setOtp("");
      setCooldown(30);
      toast.success("A new OTP has been sent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Could not resend OTP");
    } finally {
      setLoading(false);
    }
  };

  // ---------- Step 2: verify OTP + reset password ----------
  const resetPassword = async (e) => {
    e.preventDefault();

    const errs = {};
    if (otp.length !== 5) errs.otp = "Enter the 5-digit OTP";
    if (!newPassword) errs.newPassword = "New password is required";
    else if (passwordRules.some((r) => !r.test(newPassword)))
      errs.newPassword = "Password does not meet all requirements";
    if (!confirmPassword) errs.confirmPassword = "Please confirm your password";
    else if (newPassword !== confirmPassword)
      errs.confirmPassword = "Passwords do not match";

    setErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      await api.post("/users/verify-otp", {
        email: email.trim().toLowerCase(),
        otp,
        newPassword,
        confirmPassword,
      });
      toast.success("Password reset! Please log in.");
      setTimeout(() => navigate("/login"), 900);
    } catch (err) {
      const msg = err.response?.data?.message || "Could not reset password";
      toast.error(msg);
      if (/otp/i.test(msg)) setErrors({ otp: msg });
    } finally {
      setLoading(false);
    }
  };

  const submitButton = (label, icon) => (
    <motion.button
      type="submit"
      disabled={loading}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.97 }}
      className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 disabled:opacity-70"
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin" /> Please wait...
        </>
      ) : (
        <>
          {label}
          {icon}
        </>
      )}
    </motion.button>
  );

  return (
    <AuthLayout
      headline="Locked out?"
      highlight="No worries."
      text="We'll email you a one-time code so you can set a new password in seconds."
      footerText="Your OTP is hashed, valid for 10 minutes and can only be used once."
    >
      {/* Step dots */}
      <div className="mb-6 flex items-center gap-2">
        {[1, 2].map((n) => (
          <motion.div
            key={n}
            animate={{ width: step === n ? 36 : 12, opacity: step >= n ? 1 : 0.4 }}
            className="h-2 rounded-full bg-gradient-to-r from-primary-600 to-accent-500"
          />
        ))}
        <span className="ml-2 text-xs font-semibold text-muted">Step {step} of 2</span>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.form
            key="step1"
            {...slide}
            onSubmit={sendOtp}
            noValidate
            className="space-y-5"
          >
            <div>
              <motion.div
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600"
              >
                <KeyRound size={28} />
              </motion.div>
              <h1 className="text-3xl font-extrabold text-ink">Forgot password?</h1>
              <p className="mt-1 text-sm text-muted">
                Enter your registered email and we'll send you a 5-digit code.
              </p>
            </div>

            <FormInput
              icon={Mail}
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors({});
              }}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
            />

            {submitButton(
              "Send OTP",
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            )}

            <Link
              to="/login"
              className="flex items-center justify-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft size={16} /> Back to login
            </Link>
          </motion.form>
        ) : (
          <motion.form
            key="step2"
            {...slide}
            onSubmit={resetPassword}
            noValidate
            className="space-y-5"
          >
            <div>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 15 }}
                className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-success/10 text-success"
              >
                <MailCheck size={28} />
              </motion.div>
              <h1 className="text-3xl font-extrabold text-ink">Check your email</h1>
              <p className="mt-1 text-sm text-muted">
                We sent a code to <span className="font-bold text-ink">{email}</span>
              </p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-ink">
                Verification code
              </label>
              <OtpInput
                value={otp}
                onChange={(v) => {
                  setOtp(v);
                  if (errors.otp) setErrors((p) => ({ ...p, otp: "" }));
                }}
                error={errors.otp}
              />
              <div className="mt-2 text-right text-xs">
                {cooldown > 0 ? (
                  <span className="text-muted">Resend in {cooldown}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={resendOtp}
                    className="font-bold text-primary-600 hover:text-primary-700"
                  >
                    Resend OTP
                  </button>
                )}
              </div>
            </div>

            <div>
              <FormInput
                icon={Lock}
                label="New password"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (errors.newPassword) setErrors((p) => ({ ...p, newPassword: "" }));
                }}
                placeholder="Create a strong password"
                autoComplete="new-password"
                error={errors.newPassword}
                right={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-muted transition-colors hover:text-primary-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
              />
              <PasswordStrength password={newPassword} />
            </div>

            <FormInput
              icon={Lock}
              label="Confirm new password"
              type={showConfirm ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: "" }));
              }}
              placeholder="Re-enter new password"
              autoComplete="new-password"
              error={errors.confirmPassword}
              right={
                <button
                  type="button"
                  onClick={() => setShowConfirm((s) => !s)}
                  className="text-muted transition-colors hover:text-primary-600"
                >
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />

            {submitButton(
              "Reset password",
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            )}

            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrors({});
              }}
              className="flex w-full items-center justify-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft size={16} /> Use a different email
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}