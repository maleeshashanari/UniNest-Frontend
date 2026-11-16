import { Navigate, useLocation } from "react-router-dom";
import { getToken, getUser, homeFor } from "../utils/auth";

// <ProtectedRoute>                        = logged-in users only
// <ProtectedRoute role="admin">           = admins only
// <ProtectedRoute role="student" allowGuest> = students, and guests (not logged in)
export default function ProtectedRoute({ children, role, allowGuest = false }) {
  const location = useLocation();

  if (!getToken()) {
    if (allowGuest) return children;
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const user = getUser();
  if (role && user?.role !== role) {
    return <Navigate to={homeFor(user)} replace />;
  }

  return children;
}