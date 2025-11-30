import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute() {
    const { isAuthenticated, initializing } = useContext(AuthContext);
    if(initializing) return null;
    return isAuthenticated ? <Outlet /> : <Navigate to="/user/login" replace />;
}
