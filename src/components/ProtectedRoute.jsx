
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute({ allowedRole }) {

    const token = localStorage.getItem("token");

    const user = JSON.parse(localStorage.getItem("user"));

    // Check authentication and authorization
    if (!token || !user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== allowedRole) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;