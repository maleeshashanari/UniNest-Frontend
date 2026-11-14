import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GuestRoute() {
    const { user, isAuthenticated, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <Navigate
                to={user.role === "admin" ? "/admin" : "/student"}
                replace
            />
        );
    }

    return <Outlet />;
}