import { Navigate, useLocation } from "react-router-dom";
import { getToken, getUser, homeFor } from "../utils/auth";

// <ProtectedRoute> = any logged-in user
// <ProtectedRoute role="admin"> = admins only (students are sent to /home)
export default function ProtectedRoute({ children, role }) {
  const location = useLocation();

  if (!getToken()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const user = getUser();
  if (role && user?.role !== role) {
    return <Navigate to={homeFor(user)} replace />;
  }

  return children;
}