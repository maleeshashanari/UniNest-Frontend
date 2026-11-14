
import { useAuth } from "../context/AuthContext";

export default function StudentDashboard() {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="mx-auto max-w-5xl">
                <h1 className="text-3xl font-bold text-ink">
                    Welcome, {user?.firstName}!
                </h1>

                <p className="mt-2 text-muted">
                    Your UniNest student dashboard will be developed in Part 2.
                </p>

                <button
                    onClick={logout}
                    className="mt-6 rounded-lg bg-primary-600 px-6 py-3 text-white hover:bg-primary-700"
                >
                    Logout
                </button>
            </div>
        </div>
    );
}
