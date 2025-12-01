// routes/ProtectedRoute.jsx
import { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ requireRoles = [] }) {
  const { isAuthenticated, initializing, isRefreshing, user } = useContext(AuthContext);
  const location = useLocation();

  if (initializing || isRefreshing) return null;

  if (!isAuthenticated) {
    return <Navigate to="/user/login" replace state={{ from: location }} />;
  }

  if (requireRoles.length) {
    const current = Array.isArray(user?.roles) ? user.roles : [];

    if(!current.length) return null;

    const allowed = requireRoles.some((r) => current.includes(r));
    if (!allowed) {
      alert("로그인 후에 접근 가능합니다.");
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
}
