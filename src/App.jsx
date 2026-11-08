
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";

function App() {

    return (
        <BrowserRouter>

            <Navbar />

            <Routes>

                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Student Routes */}
                <Route element={<ProtectedRoute allowedRole="student" />}>
                    <Route
                        path="/student/dashboard"
                        element={<StudentDashboard />}
                    />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRole="admin" />}>
                    <Route
                        path="/admin/dashboard"
                        element={<AdminDashboard />}
                    />
                </Route>

                {/* Unknown Routes */}
                <Route
                    path="*"
                    element={
                        <div className="min-h-screen flex items-center justify-center bg-primary">
                            <h1 className="text-3xl font-bold text-secondary">
                                404 - Page Not Found
                            </h1>
                        </div>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;
