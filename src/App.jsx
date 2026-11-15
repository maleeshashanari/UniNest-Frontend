import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";

import AdminLayout from "./components/AdminLayout";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Each page loads only when opened = faster first load
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));

const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const Accommodations = lazy(() => import("./pages/Accommodations"));
const AccommodationDetails = lazy(() => import("./pages/AccommodationDetails"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAccommodations = lazy(() => import("./pages/admin/AdminAccommodations"));
const AccommodationForm = lazy(() => import("./pages/admin/AccommodationForm"));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <Toaster
          position="top-right"
          toastOptions={{ style: { borderRadius: "12px", fontWeight: 600 } }}
        />

        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Student pages (admins can open these too) */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/accommodations" element={<Accommodations />} />
              <Route path="/accommodations/:id" element={<AccommodationDetails />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>

            {/* Admin pages (students are redirected to /home) */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute role="admin">
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="accommodations" element={<AdminAccommodations />} />
              <Route path="accommodations/new" element={<AccommodationForm />} />
              <Route path="accommodations/:id/edit" element={<AccommodationForm />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;