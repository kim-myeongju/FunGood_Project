// 로그인, 회원가입 등은 로그인 상태라면 접근 불가
import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
export default function LogoutOnlyRoute() {
    const { isAuthenticated, initializing } = useContext(AuthContext);
    if(initializing) return null;
    return !isAuthenticated ? <Outlet /> : <Navigate to="/" replace />;
}
