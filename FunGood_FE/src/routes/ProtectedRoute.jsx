// routes/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ requireRoles = [] }) {
  const { isAuthenticated, initializing, user, isRefreshing } = useContext(AuthContext);
  const location = useLocation();

  if (initializing) return null;

  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace state={{ from: location }} />;
  }

  if (requireRoles.length) {
    const current = Array.isArray(user?.roles) ? user.roles : [];
    if (!current.length && (isRefreshing || initializing)) {
      return null; // 필요하면 스피너로 교체
    }
    const allowed = requireRoles.some((r) => current.includes(r));
    if (!allowed) return <Navigate to="/forbidden" replace />;
  }

  return <Outlet />;
}
