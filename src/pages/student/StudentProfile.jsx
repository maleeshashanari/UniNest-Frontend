import { useState } from "react";
import { UserRound, Lock, Save } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function StudentProfile() {
    const { user, token, setSession } = useAuth();

    const [profile, setProfile] = useState(() => ({
        firstName: user?.firstName || "",
        lastName: user?.lastName || "",
        phone: user?.phone || "",
        university: user?.university || "",
        image: user?.image || ""
    }));

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: ""
    });

    const [savingProfile, setSavingProfile] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Handle profile input changes
    const handleProfileChange = (e) => {
        const { name, value } = e.target;

        setProfile((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Handle password input changes
    const handlePasswordChange = (e) => {
        const { name, value } = e.target;

        setPasswordData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    // Update profile
    const handleProfileSubmit = async (e) => {
        e.preventDefault();

        if (!profile.firstName.trim() || !profile.lastName.trim()) {
            toast.error("Please enter your first and last name.");
            return;
        }

        try {
            setSavingProfile(true);

            const response = await api.put("/users/profile", {
                firstName: profile.firstName.trim(),
                lastName: profile.lastName.trim(),
                phone: profile.phone.trim(),
                university: profile.university.trim(),
                image: profile.image.trim()
            });

            const updatedUser = response.data.user || {
                ...user,
                ...profile
            };

            // Update authentication session
            setSession(response.data.token || token, updatedUser);

            // Update profile state
            setProfile({
                firstName: updatedUser.firstName || "",
                lastName: updatedUser.lastName || "",
                phone: updatedUser.phone || "",
                university: updatedUser.university || "",
                image: updatedUser.image || ""
            });

            toast.success("Profile updated successfully.");

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to update your profile."
            );
        } finally {
            setSavingProfile(false);
        }
    };

    // Change password
    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        if (!passwordData.currentPassword || !passwordData.newPassword) {
            toast.error("Please fill in both password fields.");
            return;
        }

        if (passwordData.newPassword.length < 8) {
            toast.error("Your new password must contain at least 8 characters.");
            return;
        }

        try {
            setChangingPassword(true);

            const response = await api.put("/users/change-password", {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });

            toast.success(
                response.data.message || "Password changed successfully."
            );

            setPasswordData({
                currentPassword: "",
                newPassword: ""
            });

        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Unable to change your password."
            );
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="mx-auto max-w-3xl space-y-8">

            {/* Page Heading */}
            <div>
                <h1 className="text-2xl font-bold text-ink">
                    My Profile
                </h1>

                <p className="mt-1 text-muted">
                    Manage your personal information and account settings.
                </p>
            </div>

            {/* Profile Information */}
            <section className="rounded-2xl border border-border bg-white p-6">

                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-primary-50 p-3 text-primary-600">
                        <UserRound size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-ink">
                            Personal Information
                        </h2>

                        <p className="text-sm text-muted">
                            Update your student profile details.
                        </p>
                    </div>
                </div>

                <form onSubmit={handleProfileSubmit} className="space-y-5">

                    <div className="grid gap-5 sm:grid-cols-2">

                        <div>
                            <label
                                htmlFor="firstName"
                                className="mb-2 block text-sm font-medium text-ink"
                            >
                                First Name
                            </label>

                            <input
                                id="firstName"
                                name="firstName"
                                value={profile.firstName}
                                onChange={handleProfileChange}
                                required
                                className="w-full rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="lastName"
                                className="mb-2 block text-sm font-medium text-ink"
                            >
                                Last Name
                            </label>

                            <input
                                id="lastName"
                                name="lastName"
                                value={profile.lastName}
                                onChange={handleProfileChange}
                                required
                                className="w-full rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                            />
                        </div>

                    </div>

                    <div>
                        <label
                            htmlFor="profileEmail"
                            className="mb-2 block text-sm font-medium text-ink"
                        >
                            Email Address
                        </label>

                        <input
                            id="profileEmail"
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full cursor-not-allowed rounded-xl border border-border bg-gray-50 p-3 text-muted"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="phone"
                            className="mb-2 block text-sm font-medium text-ink"
                        >
                            Phone Number
                        </label>

                        <input
                            id="phone"
                            name="phone"
                            type="tel"
                            value={profile.phone}
                            onChange={handleProfileChange}
                            placeholder="Enter your phone number"
                            className="w-full rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="university"
                            className="mb-2 block text-sm font-medium text-ink"
                        >
                            University
                        </label>

                        <input
                            id="university"
                            name="university"
                            value={profile.university}
                            onChange={handleProfileChange}
                            placeholder="Enter your university"
                            className="w-full rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="image"
                            className="mb-2 block text-sm font-medium text-ink"
                        >
                            Profile Image URL
                        </label>

                        <input
                            id="image"
                            name="image"
                            type="url"
                            value={profile.image}
                            onChange={handleProfileChange}
                            placeholder="https://example.com/image.jpg"
                            className="w-full rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={savingProfile}
                        className="flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <Save size={18} />

                        {savingProfile ? "Saving..." : "Save Changes"}
                    </button>

                </form>
            </section>

            {/* Change Password */}
            <section className="rounded-2xl border border-border bg-white p-6">

                <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-primary-50 p-3 text-primary-600">
                        <Lock size={22} />
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold text-ink">
                            Change Password
                        </h2>

                        <p className="text-sm text-muted">
                            Choose a strong password for your account.
                        </p>
                    </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">

                    <div>
                        <label
                            htmlFor="currentPassword"
                            className="mb-2 block text-sm font-medium text-ink"
                        >
                            Current Password
                        </label>

                        <input
                            id="currentPassword"
                            name="currentPassword"
                            type="password"
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange}
                            required
                            autoComplete="current-password"
                            className="w-full rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="newPassword"
                            className="mb-2 block text-sm font-medium text-ink"
                        >
                            New Password
                        </label>

                        <input
                            id="newPassword"
                            name="newPassword"
                            type="password"
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange}
                            required
                            minLength={8}
                            autoComplete="new-password"
                            className="w-full rounded-xl border border-border p-3 text-ink outline-none focus:border-primary-500"
                        />

                        <p className="mt-1 text-xs text-muted">
                            Use at least 8 characters.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={changingPassword}
                        className="rounded-xl bg-primary-600 px-5 py-3 font-medium text-white transition hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {changingPassword
                            ? "Changing Password..."
                            : "Change Password"}
                    </button>

                </form>
            </section>

        </div>
    );
}