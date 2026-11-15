import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { Toaster } from "react-hot-toast";

import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Each page is loaded only when opened = faster first load
const Register = lazy(() => import("./pages/Register"));
const Login = lazy(() => import("./pages/Login"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const Home = lazy(() => import("./pages/Home"));
const Profile = lazy(() => import("./pages/Profile"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));

function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-100 border-t-primary-600" />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      {/* Turns animations off automatically for users who prefer reduced motion */}
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

            {/* Logged-in routes share one navbar layout */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/home" element={<Home />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </MotionConfig>
    </BrowserRouter>
  );
}

export default App;