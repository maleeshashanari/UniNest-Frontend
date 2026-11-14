import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/AuthLayout";

export default function Login() {
    const navigate = useNavigate();
    const { setSession } = useAuth();

    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const redirectUser = (user) => {
        if (user.role === "admin") {
            navigate("/admin", { replace: true });
        } else {
            navigate("/student", { replace: true });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            const response = await api.post("/users/login", formData);

            const { token, user } = response.data;

            setSession(token, user);

            toast.success("Login successful!");

            redirectUser(user);

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Login failed. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);

                const response = await api.post("/users/google-login", {
                    token: tokenResponse.access_token
                });

                const { token, user } = response.data;

                setSession(token, user);

                toast.success("Google login successful!");

                redirectUser(user);

            } catch (error) {
                toast.error(
                    error.response?.data?.message || "Google login failed."
                );
            } finally {
                setLoading(false);
            }
        },

        onError: () => {
            toast.error("Google authentication failed.");
        }
    });

    return (
        <AuthLayout
            title="Welcome Back"
            subtitle="Sign in to continue to your UniNest account"
        >
            <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        Email Address
                    </label>

                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />

                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter your email"
                            required
                            className="w-full rounded-lg border border-border py-3 pl-10 pr-4 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        Password
                    </label>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />

                        <input
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                            className="w-full rounded-lg border border-border py-3 pl-10 pr-12 outline-none focus:border-primary-600 focus:ring-2 focus:ring-primary-100"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                <div className="flex justify-end">
                    <Link
                        to="/forgot-password"
                        className="text-sm font-medium text-primary-600 hover:underline"
                    >
                        Forgot password?
                    </Link>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {loading ? "Signing in..." : "Sign In"}
                </button>

            </form>

            <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-border"></div>
                <span className="text-xs text-muted">OR</span>
                <div className="h-px flex-1 bg-border"></div>
            </div>

            <button
                type="button"
                onClick={() => googleLogin()}
                disabled={loading}
                className="flex w-full items-center justify-center gap-3 rounded-lg border border-border py-3 font-medium text-ink transition hover:bg-gray-50 disabled:opacity-60"
            >
                <img
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                    alt="Google"
                    className="h-5 w-5"
                />

                Continue with Google
            </button>

            <p className="mt-6 text-center text-sm text-muted">
                Don't have an account?{" "}
                <Link
                    to="/register"
                    className="font-semibold text-primary-600 hover:underline"
                >
                    Create an account
                </Link>
            </p>
        </AuthLayout>
    );
}