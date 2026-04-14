import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../features/auth/hooks/useAuth";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { SignupPage } from "../features/auth/pages/SignupPage";
import { DashboardPage } from "../pages/DashboardPage";
import { TeacherDashboardPage } from "../pages/TeacherDashboardPage";

function getDefaultDashboardPath(user) {
  if (user?.role === "teacher") {
    return "/teacher/dashboard";
  }

  return "/dashboard";
}

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (Array.isArray(allowedRoles) && !allowedRoles.includes(user?.role)) {
    return <Navigate to={getDefaultDashboardPath(user)} replace />;
  }

  return children;
}

function PublicOnlyRoute({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={getDefaultDashboardPath(user)} replace />;
  }

  return children;
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin", "student"]}>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/dashboard"
        element={
          <ProtectedRoute allowedRoles={["teacher"]}>
            <TeacherDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
