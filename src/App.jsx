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
const MyBookings = lazy(() => import("./pages/MyBookings"));
const MyFeedback = lazy(() => import("./pages/MyFeedback"));
const Contact = lazy(() => import("./pages/Contact"));

const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminAccommodations = lazy(() => import("./pages/admin/AdminAccommodations"));
const AccommodationForm = lazy(() => import("./pages/admin/AccommodationForm"));
const AdminBookings = lazy(() => import("./pages/admin/AdminBookings"));
const AdminFeedback = lazy(() => import("./pages/admin/AdminFeedback"));
const AdminStudents = lazy(() => import("./pages/admin/AdminStudents"));
const AdminRoles = lazy(() => import("./pages/admin/AdminRoles"));
const AdminContacts = lazy(() => import("./pages/admin/AdminContacts"));

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
            {/* Auth pages */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Main site: guests can browse, so this layout is NOT protected */}
            <Route element={<AppLayout />}>
              {/* Open to everyone */}
              <Route path="/home" element={<Home />} />
              <Route path="/accommodations" element={<Accommodations />} />
              <Route path="/accommodations/:id" element={<AccommodationDetails />} />

              {/* Guests can open it, but get a "register first" popup when they send */}
              <Route
                path="/contact"
                element={
                  <ProtectedRoute role="student" allowGuest>
                    <Contact />
                  </ProtectedRoute>
                }
              />

              {/* Logged-in users only (guests are sent to /login) */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/change-password"
                element={
                  <ProtectedRoute>
                    <ChangePassword />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-bookings"
                element={
                  <ProtectedRoute role="student">
                    <MyBookings />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-reviews"
                element={
                  <ProtectedRoute role="student">
                    <MyFeedback />
                  </ProtectedRoute>
                }
              />
            </Route>

            {/* Admin pages (guests go to /login, students go to /home) */}
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
              <Route path="bookings" element={<AdminBookings />} />
              <Route path="feedback" element={<AdminFeedback />} />
              <Route path="contact" element={<AdminContacts />} />
              <Route path="students" element={<AdminStudents />} />
              <Route path="roles" element={<AdminRoles />} />
            </Route>

            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </Suspense>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;