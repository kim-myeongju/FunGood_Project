import { createContext, useEffect, useMemo, useRef, useState } from "react";
import {
  axiosInstance,
  getStoredToken,
  saveToken,
  parseJwt,
  scheduleTokenRefresh,
  clearRefreshTimer,
  tryRefreshImmediately,
} from "../lib/api";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 부팅 1회 플래그 (validate/refresh 루프 중복 방지)
  const bootstrappedRef = useRef(false);

  function setTokenEverywhere(token) {
    setAccessToken(token);
    saveToken(token);
  }

  function getRolesFromToken(token) {
    const payload = parseJwt(token);
    const raw = payload.roles;
    return Array.isArray(raw) ? raw : raw ? [raw] : [];
  }

  useEffect(() => {
    if (bootstrappedRef.current) return;
    bootstrappedRef.current = true;

    (async () => {
      try {
        const savedToken = getStoredToken();
        if (savedToken) {
          setAccessToken(savedToken);

          try {
            const { data } = await axiosInstance.post("/user/validate", {}, { withCredentials: true });
            if (Array.isArray(data.roles)) {
              setUser({ roles: data.roles });
            } else {
              setUser({ roles: getRolesFromToken(savedToken) });
            }
          } catch {
            try {
              setIsRefreshing(true);
              const newAccessToken = await tryRefreshImmediately();
              setTokenEverywhere(newAccessToken);
              setUser({ roles: getRolesFromToken(newAccessToken) });
            } catch {
              setTokenEverywhere(null);
              setUser(null);
            } finally {
              setIsRefreshing(false);
            }
          }

          if (getStoredToken()) {
            scheduleTokenRefresh(getStoredToken(), 10);
          }
        } else {
          // 저장된 토큰 없음 비로그인
          setUser(null);
        }
      } finally {
        setInitializing(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!accessToken) {
      // 비로그인 정리
      setUser(null);
      clearRefreshTimer();
      return;
    }

    const roles = getRolesFromToken(accessToken);
    if (!Array.isArray(user?.roles) || user.roles.length === 0) {
      setUser({ roles });
    }

    scheduleTokenRefresh(accessToken, 10);
  }, [accessToken]);

  async function onLoginSuccess(newAccessToken) {
    setTokenEverywhere(newAccessToken);
    setUser({ roles: getRolesFromToken(newAccessToken) });
    scheduleTokenRefresh(newAccessToken, 10);
  }

  const logout = async () => {
    try {
      await axiosInstance.post("/user/logout", null, { withCredentials: true });
    } catch { }
    clearRefreshTimer();
    setTokenEverywhere(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: !!accessToken,
      initializing,
      isRefreshing,

      onLoginSuccess,
      logout,
      setAccessToken: setTokenEverywhere,
      setUser,
    }),
    [accessToken, user, initializing, isRefreshing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
