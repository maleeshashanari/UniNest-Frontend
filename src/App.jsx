
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>

                    {/* Guest Routes */}
                    <Route element={<GuestRoute />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>

                    {/* Password Recovery */}
                    <Route
                        path="/forgot-password"
                        element={<ForgotPassword />}
                    />

                    <Route
                        path="/reset-password"
                        element={<ResetPassword />}
                    />

                    {/* Student Routes */}
                    <Route element={<ProtectedRoute allowedRole="student" />}>
                        <Route
                            path="/student"
                            element={<StudentDashboard />}
                        />
                    </Route>

                    {/* Admin Routes */}
                    <Route element={<ProtectedRoute allowedRole="admin" />}>
                        <Route
                            path="/admin"
                            element={<AdminDashboard />}
                        />
                    </Route>

                    {/* Default Route */}
                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />

                    <Route
                        path="*"
                        element={<Navigate to="/login" replace />}
                    />

                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
