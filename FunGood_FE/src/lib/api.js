import axios from "axios";

export const ACCESSTOKEN_KEY = "access_token";
export const API_BASE_URL = "http://localhost:8080";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

// 토큰 보관/조회
export function getStoredToken() {
  return localStorage.getItem(ACCESSTOKEN_KEY) || null;
}

export function saveToken(token) {
  if (token) localStorage.setItem(ACCESSTOKEN_KEY, token);
  else localStorage.removeItem(ACCESSTOKEN_KEY);
}

// 만료 10초 전 갱신 시도
let refreshTimer = null;

export function clearRefreshTimer() {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}

export function scheduleTokenRefresh(token, leadSeconds = 10) {
  clearRefreshTimer();

  const payload = parseJwt(token);
  if (!payload.exp) return;

  const expMs = payload.exp * 1000;
  const delay = Math.max(0, expMs - Date.now() - leadSeconds * 1000);

  console.log(`⏳ 엑세스 토큰 갱신 예정: 약 ${Math.round(delay / 1000)}초 후 (만료 ${leadSeconds}초 전)`);

  refreshTimer = setTimeout(tryRefreshImmediately, delay);
}

// refresh 단일 파이프라인 + 대기열
let isRefreshing = false;
let refreshSubscribers = [];

// 대기열 등록
function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}

// 대기열 모두 깨우기
function onRefreshed(newAccessToken) {
  refreshSubscribers.forEach((cb) => cb(newAccessToken));
  refreshSubscribers = [];
}

// 즉시 재발급 시도
export async function tryRefreshImmediately() {
  try {
    const res = await axiosInstance.post("/user/refresh", {}, { withCredentials: true });
    const newAccessToken = res.data.access_token;
    if (!newAccessToken) throw new Error("서버에서 엑세스토큰 반환 X");

    saveToken(newAccessToken);
    scheduleTokenRefresh(newAccessToken);
    onRefreshed(newAccessToken);
    console.log("엑세스토큰 갱신 성공");
    return newAccessToken;
  } catch (err) {
    console.error("엑세스토큰 재발급 실패 : ", err);
    onRefreshed(null);
    clearRefreshTimer();
    saveToken(null);
    throw err;
  }
}

// 요청 인터셉터 : Authorization 자동 첨부
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    config.withCredentials = true;
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 : 401 대응, 대기열 재시도
axiosInstance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config || {};
    const status = error.response.status;

    if (status === 401 && !original._retry && !original.url?.includes("/user/refresh")) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newAccessToken) => {
            if (!newAccessToken) return reject(error);
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${newAccessToken}`;
            resolve(axiosInstance(original));
          });
        });
      }

      isRefreshing = true;
      try {
        const newAccessToken = await tryRefreshImmediately();
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(original);
      } catch (err) {
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
