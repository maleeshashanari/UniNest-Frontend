import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";
import { ArrowRight, Eye, EyeOff, Loader2, Lock, Mail, Sparkles } from "lucide-react";

import api from "../api/axios";
import AuthLayout from "../components/AuthLayout";
import FormInput from "../components/FormInput";
import GoogleButton from "../components/GoogleButton";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
};
const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname || "/home";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const saveSession = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  };

  // All hooks must be called BEFORE any early return
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setGoogleLoading(true);
        const res = await api.post("/users/google-login", {
          token: tokenResponse.access_token,
        });
        saveSession(res.data);
        toast.success(`Welcome, ${res.data.user.firstName}!`);
        navigate(redirectTo, { replace: true });
      } catch (err) {
        toast.error(err.response?.data?.message || "Google login failed");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => toast.error("Google sign-in was cancelled or failed"),
  });

  // Already logged in? Skip the login page (safe now, after all hooks)
  if (localStorage.getItem("token")) {
    return <Navigate to="/home" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      e.email = "Invalid email format";
    if (!form.password) e.password = "Password is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);
      const res = await api.post("/users/login", {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      saveSession(res.data);
      toast.success(`Welcome back, ${res.data.user.firstName}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      headline="Welcome back,"
      highlight="nest awaits."
      text="Log in to find rooms, connect with students and manage your stay near campus."
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
            <Sparkles size={14} /> Good to see you
          </div>
          <h1 className="text-3xl font-extrabold text-ink">Log in</h1>
          <p className="mt-1 text-sm text-muted">Enter your details to continue.</p>
        </motion.div>

        <motion.div variants={item}>
          <GoogleButton
            onClick={() => googleLogin()}
            loading={googleLoading}
            text="Continue with Google"
          />
        </motion.div>

        <motion.div variants={item} className="flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs font-medium text-muted">or log in with email</span>
          <div className="h-px flex-1 bg-border" />
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
            icon={Lock}
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
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
          <div className="mt-2 text-right">
            <Link
              to="/forgot-password"
              className="text-xs font-bold text-primary-600 hover:text-primary-700"
            >
              Forgot password?
            </Link>
          </div>
        </motion.div>

        <motion.div variants={item}>
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 via-primary-500 to-accent-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary-500/30 disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Logging in...
              </>
            ) : (
              <>
                Log in
                <ArrowRight
                  size={18}
                  className="transition-transform group-hover:translate-x-1"
                />
              </>
            )}
          </motion.button>
        </motion.div>

        <motion.p variants={item} className="text-center text-sm text-muted">
          New to UniNest?{" "}
          <Link to="/register" className="font-bold text-primary-600 hover:text-primary-700">
            Create an account
          </Link>
        </motion.p>
      </motion.form>
    </AuthLayout>
  );
}