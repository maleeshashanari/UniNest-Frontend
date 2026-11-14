import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import AuthLayout from "../../components/AuthLayout";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setLoading(true);

            await api.post("/users/send-otp", { email });

            toast.success("OTP sent to your email.");

            navigate(
                `/reset-password?email=${encodeURIComponent(email)}`
            );

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Unable to send OTP."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Forgot Password?"
            subtitle="Enter your email address to receive a password reset OTP"
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
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your registered email"
                            required
                            className="w-full rounded-lg border border-border py-3 pl-10 pr-4 outline-none focus:border-primary-600"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary-600 py-3 font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                    {loading ? "Sending OTP..." : "Send OTP"}
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