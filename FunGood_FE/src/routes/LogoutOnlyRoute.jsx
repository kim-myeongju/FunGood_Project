import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function LogoutOnlyRoute() {
  const { isAuthenticated, initializing } = useContext(AuthContext);

  if (initializing) return null;

  return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}
