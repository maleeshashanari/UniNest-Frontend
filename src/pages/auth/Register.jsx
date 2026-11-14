
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../api/axios";
import AuthLayout from "../../components/AuthLayout";

export default function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        university: ""
    });

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!passwordRegex.test(formData.password)) {
            toast.error(
                "Password must contain 8 characters, uppercase, lowercase, number and special character."
            );
            return;
        }

        try {
            setLoading(true);

            await api.post("/users/register", formData);

            toast.success("Account created successfully!");

            navigate("/login");

        } catch (error) {
            toast.error(
                error.response?.data?.message || "Registration failed."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthLayout
            title="Create Your Account"
            subtitle="Join UniNest and find your ideal student accommodation"
        >
            <form onSubmit={handleSubmit} className="space-y-4">

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                    <div>
                        <label className="mb-2 block text-sm font-medium text-ink">
                            First Name
                        </label>

                        <input
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            placeholder="First name"
                            required
                            className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary-600"
                        />
                    </div>

                    <div>
                        <label className="mb-2 block text-sm font-medium text-ink">
                            Last Name
                        </label>

                        <input
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            placeholder="Last name"
                            required
                            className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary-600"
                        />
                    </div>

                </div>

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
                            className="w-full rounded-lg border border-border py-3 pl-10 pr-4 outline-none focus:border-primary-600"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        Phone Number <span className="text-muted">(Optional)</span>
                    </label>

                    <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={18} />

                        <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            placeholder="Enter your phone number"
                            className="w-full rounded-lg border border-border py-3 pl-10 pr-4 outline-none focus:border-primary-600"
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        University <span className="text-muted">(Optional)</span>
                    </label>

                    <input
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        placeholder="Enter your university"
                        className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary-600"
                    />
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
                            placeholder="Create a password"
                            required
                            className="w-full rounded-lg border border-border py-3 pl-10 pr-12 outline-none focus:border-primary-600"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <p className="mt-2 text-xs text-muted">
                        Minimum 8 characters, including uppercase, lowercase,
                        number and special character.
                    </p>
                </div>

                <div>
                    <label className="mb-2 block text-sm font-medium text-ink">
                        Confirm Password
                    </label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        required
                        className="w-full rounded-lg border border-border px-4 py-3 outline-none focus:border-primary-600"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-primary-600 py-3 font-semibold text-white transition hover:bg-primary-700 disabled:opacity-60"
                >
                    {loading ? "Creating account..." : "Create Account"}
                </button>

            </form>

            <p className="mt-6 text-center text-sm text-muted">
                Already have an account?{" "}
                <Link
                    to="/login"
                    className="font-semibold text-primary-600 hover:underline"
                >
                    Sign In
                </Link>
            </p>
        </AuthLayout>
    );
}