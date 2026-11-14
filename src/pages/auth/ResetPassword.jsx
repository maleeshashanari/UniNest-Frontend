
import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import AuthLayout from "../../components/AuthLayout";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    const [formData, setFormData] = useState({
        email: searchParams.get("email") || "",
        otp: "",
        newPassword: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!passwordRegex.test(formData.newPassword)) {
            toast.error(
                "Password must contain uppercase, lowercase, number and special character."
            );
            return;
        }

        try {
            setLoading(true);

            await api.post("/users/verify-otp", formData);

            toast.success("Password reset successfully!");

            navigate("/login");

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Password reset failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Reset Password"
            subtitle="Enter the OTP sent to your email and create a new password"
        >
            <form onSubmit={handleSubmit} className="space-y-5">

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        Email Address
                    </label>

                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary-600"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        Five-Digit OTP
                    </label>

                    <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleChange}
                        placeholder="Enter OTP"
                        maxLength={5}
                        required
                        className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary-600"
                    />
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        New Password
                    </label>

                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />

                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            placeholder="Enter new password"
                            required
                            className="w-full rounded-lg border border-border py-3 pl-10 pr-4 outline-none focus:border-primary-600"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        Confirm New Password
                    </label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                        required
                        className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary-600"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                    {loading ? "Resetting..." : "Reset Password"}
                </button>

            </form>

            <Link
                to="/login"
                className="mt-6 flex items-center justify-center gap-2 text-sm font-medium text-primary-600 hover:underline"
            >
                <ArrowLeft size={16} />
                Back to Login
            </Link>
        </AuthLayout>
    );
}
