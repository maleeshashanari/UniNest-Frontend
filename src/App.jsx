import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestRoute from "./routes/GuestRoute";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

import StudentLayout from "./components/StudentLayout";
import StudentHome from "./pages/student/StudentHome";
import Accommodations from "./pages/student/Accommodations";
import AccommodationDetails from "./pages/student/AccommodationDetails";

import AdminDashboard from "./pages/AdminDashboard";

function ComingSoon({ title }) {
    return (
        <div className="rounded-2xl border border-border bg-white p-10 text-center">
            <h1 className="text-2xl font-bold text-ink">{title}</h1>
            <p className="mt-2 text-sm text-muted">
                This section will be available in the next development part.
            </p>
        </div>
    );
}

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

                        <Route path="/student" element={<StudentLayout />}>

                            <Route index element={<StudentHome />} />

                            <Route
                                path="accommodations"
                                element={<Accommodations />}
                            />

                            <Route
                                path="accommodations/:id"
                                element={<AccommodationDetails />}
                            />

                            {/* Part 3 */}
                            <Route
                                path="bookings"
                                element={<ComingSoon title="My Bookings" />}
                            />

                            <Route
                                path="profile"
                                element={<ComingSoon title="My Profile" />}
                            />

                        </Route>

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