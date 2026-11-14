import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import {
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
  Home,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";

import api from "../api/axios";
import FormInput from "../components/FormInput";
import GoogleButton from "../components/GoogleButton";
import PasswordStrength from "../components/PasswordStrength";
import { passwordRules } from "../data/passwordRules";
import UniversitySelect from "../components/UniversitySelect";
import { OTHERS } from "../data/universities";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const floatingIcons = [
  { Icon: Home, top: "12%", left: "10%", delay: 0 },
  { Icon: GraduationCap, top: "22%", left: "72%", delay: 0.6 },
  { Icon: MapPin, top: "62%", left: "14%", delay: 1.2 },
  { Icon: Users, top: "74%", left: "66%", delay: 1.8 },
];

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [university, setUniversity] = useState("");
  const [customUniversity, setCustomUniversity] = useState("");
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // ---------- Validation (mirrors the backend rules) ----------
  const validate = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = "First name is required";
    if (!form.lastName.trim()) e.lastName = "Last name is required";

    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Invalid email format";

    // Phone is optional: only validate if the user typed something
    if (form.phone.trim() && !/^\+?[0-9\s-]{9,15}$/.test(form.phone.trim()))
      e.phone = "Enter a valid phone number";

    if (!form.password) e.password = "Password is required";
    else if (passwordRules.some((r) => !r.test(form.password)))
      e.password = "Password does not meet all requirements";

    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = "Passwords do not match";

    // University is optional, but if "Others" is chosen the name is required
    if (university === OTHERS && !customUniversity.trim())
      e.university = "Please enter your university name";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ---------- Normal register ----------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fix the highlighted fields");
      return;
    }

    const finalUniversity = university === OTHERS ? customUniversity.trim() : university;

    try {
      setLoading(true);
      await api.post("/users/register", {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        confirmPassword: form.confirmPassword,
        phone: form.phone.trim(),
        university: finalUniversity,
      });

      toast.success("Account created! Please log in.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (err) {
      console.error("Register error:", err);
      if (!err.response) {
        toast.error("Cannot reach the server. Check the backend, VITE_API_URL and CORS.");
      } else {
        toast.error(
          err.response.data?.message || `Registration failed (status ${err.response.status})`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // ---------- Google login ----------
  // Your backend expects a Google ACCESS token, which useGoogleLogin provides.
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        const res = await api.post("/users/google-login", {
          token: tokenResponse.access_token,
        });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        toast.success(`Welcome, ${res.data.user.firstName}!`);
        navigate("/home");
      } catch (err) {
        toast.error(err.response?.data?.message || "Google login failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error("Google sign-in was cancelled or failed"),
  });

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-background">
      {/* ================= LEFT: animated showcase ================= */}
      <div className="relative hidden w-[45%] overflow-hidden bg-gradient-to-br from-primary-900 via-primary-700 to-primary-500 bg-[length:200%_200%] animate-gradient lg:block">
        <div className="absolute -left-20 top-10 h-72 w-72 rounded-full bg-accent-500/40 blur-3xl animate-blob" />
        <div className="absolute -right-10 bottom-10 h-80 w-80 rounded-full bg-primary-300/40 blur-3xl animate-blob [animation-delay:4s]" />

        {floatingIcons.map(({ Icon, top, left, delay }, i) => (
          <motion.div
            key={i}
            style={{ top, left }}
            animate={{ y: [0, -18, 0], rotate: [0, 6, -6, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay, ease: "easeInOut" }}
            className="absolute flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 text-white shadow-xl backdrop-blur-md"
          >
            <Icon size={28} />
          </motion.div>
        ))}

        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2.5 text-2xl font-extrabold"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-primary-600">
              <Home size={22} />
            </span>
            UniNest
          </motion.div>

          <div>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-extrabold leading-tight xl:text-5xl"
            >
              Your campus life,
              <br />
              <span className="text-accent-300">settled in.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-4 max-w-sm text-primary-100"
            >
              Join thousands of Sri Lankan students finding their perfect nest near campus.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-md"
          >
            <ShieldCheck className="text-accent-300" />
            <p className="text-sm text-primary-50">
              Secure sign-up with encrypted passwords and verified Google login.
            </p>
          </motion.div>
        </div>
      </div>

      {/* ================= RIGHT: form ================= */}
      <div className="relative flex flex-1 items-center justify-center px-4 py-10 sm:px-8">
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary-200/60 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute -bottom-24 -left-10 h-72 w-72 rounded-full bg-accent-100 blur-3xl animate-blob [animation-delay:6s]" />

        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative w-full max-w-xl rounded-3xl border border-white bg-white/70 p-6 shadow-2xl shadow-primary-900/10 backdrop-blur-xl sm:p-9"
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
              <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-accent-50 px-3 py-1 text-xs font-bold text-accent-600">
                <Sparkles size={14} /> Free for students
              </div>
              <h1 className="text-3xl font-extrabold text-ink">Create your account</h1>
              <p className="mt-1 text-sm text-muted">
                Start your UniNest journey in less than a minute.
              </p>
            </motion.div>

            <motion.div variants={item}>
              <GoogleButton
                onClick={() => googleLogin()}
                loading={googleLoading}
                text="Sign up with Google"
              />
            </motion.div>

            <motion.div variants={item} className="flex items-center gap-3">
              <div className="h-px flex-1 bg-border" />
              <span className="text-xs font-medium text-muted">or register with email</span>
              <div className="h-px flex-1 bg-border" />
            </motion.div>

            <motion.div variants={item} className="grid gap-5 sm:grid-cols-2">
              <FormInput
                icon={User}
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Nimal"
                autoComplete="given-name"
                error={errors.firstName}
              />
              <FormInput
                icon={User}
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Perera"
                autoComplete="family-name"
                error={errors.lastName}
              />
            </motion.div>

            <motion.div variants={item}>
              <FormInput
                icon={Mail}
                label="Email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                error={errors.email}
              />
            </motion.div>

            <motion.div variants={item}>
              <FormInput
                icon={Phone}
                label="Phone number"
                optional
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+94 77 123 4567"
                autoComplete="tel"
                error={errors.phone}
              />
            </motion.div>

            <motion.div variants={item} className="relative z-20">
              <UniversitySelect
                value={university}
                onChange={(v) => {
                  setUniversity(v);
                  if (errors.university) setErrors((p) => ({ ...p, university: "" }));
                }}
                customValue={customUniversity}
                onCustomChange={(v) => {
                  setCustomUniversity(v);
                  if (errors.university) setErrors((p) => ({ ...p, university: "" }));
                }}
                error={errors.university}
              />
            </motion.div>

            <motion.div variants={item}>
              <FormInput
                icon={Lock}
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a strong password"
                autoComplete="new-password"
                error={errors.password}
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
              <PasswordStrength password={form.password} />
            </motion.div>

            <motion.div variants={item}>
              <FormInput
                icon={Lock}
                label="Confirm password"
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter your password"
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
            </motion.div>

            <motion.div variants={item}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 bg-[length:200%_200%] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 transition-all hover:animate-gradient disabled:opacity-70"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {loading ? (
                    <motion.span
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      <Loader2 size={18} className="animate-spin" /> Creating account...
                    </motion.span>
                  ) : (
                    <motion.span
                      key="idle"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex items-center gap-2"
                    >
                      Create account
                      <ArrowRight
                        size={18}
                        className="transition-transform group-hover:translate-x-1"
                      />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </motion.div>

            <motion.p variants={item} className="text-center text-sm text-muted">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-primary-600 hover:text-primary-700">
                Log in
              </Link>
            </motion.p>
          </motion.form>
        </motion.div>
      </div>
    </div>
  );
}