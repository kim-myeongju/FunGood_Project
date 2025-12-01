// context/AuthContext.jsx
import { createContext, useEffect, useMemo, useRef, useState } from "react";
import { axiosInstance } from "../lib/api";

export const AuthContext = createContext(null);

const STORAGE_KEY = "access_token";

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null); // { roles: [...] }만 최소 저장
  const [initializing, setInitializing] = useState(true);

  // refresh 중복 호출 방지
  const isRefreshingRef = useRef(false);
  const refreshPromiseRef = useRef(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshWaitersRef = useRef([]);

  const triedInitialRefreshRef = useRef(false);

  // ===== [추가] localStorage + 메모리에 동시 저장하는 setAccessToken =====
  function saveTokenLocalStorage(token) {
    setAccessToken(token);
    if (token) localStorage.setItem(STORAGE_KEY, token);
    else localStorage.removeItem(STORAGE_KEY);
  }

  // base64url 디코딩 + JWT payload 파싱 =====
  function base64UrlDecode(str) {
    try {
      const pad = (s) => s + "===".slice((s.length + 3) % 4);
      const b64 = pad(str).replace(/-/g, "+").replace(/_/g, "/");
      return atob(b64);
    } catch {
      return null;
    }
  }

  // user_role 추출
  function getRolesFromToken(token) {
    try {
      const parts = token?.split(".");
      if (!parts || parts.length < 2) return [];
      const jsonStr = base64UrlDecode(parts[1]);
      if (!jsonStr) return [];
      const payload = JSON.parse(jsonStr);
      const raw = payload?.roles;
      if (!raw) return [];
      return Array.isArray(raw) ? raw : [raw];
    } catch {
      return [];
    }
  }

  // userId 추출
  function getUserIdFromToken(token) {
    try {
      const parts = token.split(".");
      if (parts.length < 2) return null;

      const jsonStr = base64UrlDecode(parts[1]);
      const payload = JSON.parse(jsonStr);

      return payload.sub || null;
    } catch {
      return null;
    }
  }

  function notifyRefreshDone() {
    const list = refreshWaitersRef.current.splice(0);
    list.forEach((resolve) => resolve());
  }

  function waitForRefresh() {
    return new Promise((resolve) => {
      refreshWaitersRef.current.push(resolve);
    });
  }

  // exp(만료시각, 초 단위) 추출
  function getExpFromToken(token) {
    try {
      const parts = token?.split(".");
      if (!parts || parts.length < 2) return null;
      const jsonStr = base64UrlDecode(parts[1]);
      if (!jsonStr) return null;
      const payload = JSON.parse(jsonStr);
      // JWT 표준: exp = seconds since epoch
      return typeof payload?.exp === "number" ? payload.exp : null;
    } catch {
      return null;
    }
  }

  // 리프레시 타이머 ref
  const refreshTimerRef = useRef(null);

  // 선제 갱신 함수 (중복호출 방지 플래그 활용)
  async function proactiveRefresh() {
    try {
      if (isRefreshingRef.current && refreshPromiseRef.current) {
        await refreshPromiseRef.current; // 이미 진행 중이면 결과만 기다림
        return;
      }
      isRefreshingRef.current = true;
      setIsRefreshing(true);

      refreshPromiseRef.current = (async () => {
        const { data } = await axiosInstance.post("/user/refresh", null);
        const newAccessToken = data.access_token;
        if (!newAccessToken) {
          saveTokenLocalStorage(null);
          throw new Error("엑세스 토큰 갱신 실패");
        }
        saveTokenLocalStorage(newAccessToken);
        return newAccessToken;
      })();

      await refreshPromiseRef.current;
    } catch {
      // 실패 시에는 기존 인터셉터가 401에서 처리
      saveTokenLocalStorage(null);
    } finally {
      isRefreshingRef.current = false;
      refreshPromiseRef.current = null;
      setIsRefreshing(false);
      notifyRefreshDone();
    }
  }

  // 토큰 만료 10초 전 선제 갱신 스케줄
  function scheduleProactiveRefresh(token, leadSeconds = 10) {
    // 기존 타이머 삭제
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
    const expSec = getExpFromToken(token);
    if (!expSec) return; // exp 없으면 스킵

    const expMs = expSec * 1000;
    const refreshAt = expMs - leadSeconds * 1000;
    const delay = Math.max(0, refreshAt - Date.now());

    console.log(`엑세스토큰 갱신 예정: 약 ${Math.round(delay / 1000)}초 후 (만료 ${leadSeconds}초 전)`);

    refreshTimerRef.current = setTimeout(() => {
      // 비가시성/오프라인이면 살짝 뒤에 재시도
      if (document.visibilityState === "hidden" || navigator.onLine === false) {
        refreshTimerRef.current = setTimeout(() => proactiveRefresh(), 3000);
      } else {
        proactiveRefresh();
      }
    }, delay);
  }

  // ===== 요청 인터셉터: Authorization 자동 첨부 =====
  useEffect(() => {
    const reqId = axiosInstance.interceptors.request.use((config) => {
      if (accessToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    });
    return () => axiosInstance.interceptors.request.eject(reqId);
  }, [accessToken]);

  // ===== 응답 인터셉터: 401 → refresh 1회, 원 요청 재시도 =====
  useEffect(() => {
    const resId = axiosInstance.interceptors.response.use(
      (res) => res,
      async (error) => {
        // 네트워크 에러는 그대로
        if (!error.response) return Promise.reject(error);

        const original = error.config || {};
        const status = error.response.status;

        // refresh 자체가 401이면 재시도 금지 (무한루프 방지)
        const url = original.url || "";
        if (url.includes("/user/refresh")) {
          return Promise.reject(error);
        }

        // 401이 아니거나 이미 재시도했다면 종료
        if (status !== 401 || original._retry) {
          return Promise.reject(error);
        }
        original._retry = true;

        try {
          // 이미 갱신 중이면 그 결과 기다리기
          if (isRefreshingRef.current && refreshPromiseRef.current) {
            const newToken = await refreshPromiseRef.current;
            original.headers = original.headers || {};
            original.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(original);
          }

          // 갱신 시작
          isRefreshingRef.current = true;
          setIsRefreshing(true);
          refreshPromiseRef.current = (async () => {
            const { data } = await axiosInstance.post("/user/refresh", null);
            const newAccessToken = data.access_token;
            if (!newAccessToken) {
              saveTokenLocalStorage(null);
              throw new Error("엑세스 토큰 갱신 실패 (리프레시토큰 없거나 만료)");
            }

            // [수정] roles 세팅은 아래 accessToken effect가 처리 → 여기선 토큰만 교체
            saveTokenLocalStorage(newAccessToken);
            console.log("엑세스토큰 재발급 완료 : ", getUserIdFromToken(newAccessToken));

            return newAccessToken;
          })();

          const newAccessToken = await refreshPromiseRef.current;

          // 정리
          isRefreshingRef.current = false;
          refreshPromiseRef.current = null;

          setIsRefreshing(false);
          notifyRefreshDone();

          // 실패했던 원 요청 재시도
          original.headers = original.headers || {};
          original.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(original);
        } catch (err) {
          await logout();
          isRefreshingRef.current = false;
          refreshPromiseRef.current = null;
          setIsRefreshing(false);
          notifyRefreshDone();
          return Promise.reject(err);
        }
      }
    );
    return () => axiosInstance.interceptors.response.eject(resId);
  }, []);

  // ===== [신규] accessToken 변경 시마다 user.roles만 자동 세팅 (핵심) =====
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved) {
      setAccessToken(saved);
    } else {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    if (!accessToken) {
      setUser(null);
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current);
        refreshTimerRef.current = null;
      }
      setInitializing(false);
      return;
    }

    const roles = getRolesFromToken(accessToken);
    const userId = getUserIdFromToken(accessToken);

    // [추가] roles가 비면(옛 토큰일 가능성) 최초 1회만 proactiveRefresh
    if ((!roles || roles.length === 0) && !triedInitialRefreshRef.current) {
      triedInitialRefreshRef.current = true;
      (async () => {
        await proactiveRefresh(); // 성공 시 saveTokenLocalStorage로 최신 토큰 저장됨
        // 갱신된 accessToken으로 다음 렌더에서 roles가 채워짐
        setInitializing(false);
      })();
      return; // 이번 턴은 대기
    }

    console.log("현재 로그인:", userId);
    setUser({ roles });

    scheduleProactiveRefresh(accessToken, 10);

    setInitializing(false);
  }, [accessToken]);

  // ===== 로그아웃 =====
  const logout = async () => {
    try {
      await axiosInstance.post("/user/logout", null);
    } catch { }

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }

    saveTokenLocalStorage(null);
    setUser(null);
    console.log("로그아웃 완료");
  };

  const value = useMemo(
    () => ({
      accessToken,
      user,
      isAuthenticated: !!accessToken,
      initializing,

      saveTokenLocalStorage,
      setAccessToken: saveTokenLocalStorage,
      setUser,
      logout,

      isRefreshing,
      waitForRefresh,
    }),
    [accessToken, user, initializing, isRefreshing]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
