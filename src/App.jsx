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
import StudentBookings from "./pages/student/StudentBookings";
import StudentProfile from "./pages/student/StudentProfile";

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

                            <Route
                                path="bookings"
                                element={<StudentBookings />}
                            />

                            <Route
                                path="profile"
                                element={<StudentProfile />}
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