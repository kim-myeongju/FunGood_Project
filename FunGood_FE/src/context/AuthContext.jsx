import { createContext,  useEffect, useMemo, useState } from "react";
import axios from "axios";

export const AuthContext = createContext(null);

export const AuthProvider = ({children}) => {
    const [accessToken, setAccessToken] = useState(null);
    const [initializing, setInitializing] = useState(true);

    // 앱 첫 로드 시: refresh 쿠키로 새 access token 시도(있으면 자동 로그인)
    useEffect(() => {
        (async () => {
            try {
                const {data} = await axios.post("http://localhost:8080/user/refresh", null, {withCredentials: true});
                if(data?.accessToken || data?.access_token) {
                    setAccessToken(data.accessToken ?? data.access_token);
                }
            } catch {
                // fail refresh -> logout or no login state
            } finally {
                setInitializing(false);
            }
        })();
    }, []);

    // axios 요청에 access token 자동 첨부
    useEffect(() => {
        const id = axios.interceptors.request.use((config) => {
            const token = accessToken;
            if(token) {
                config.headers = config.headers ?? {};
                config.headers.Authorization = `Bearer ${token}`;
            }
            config.withCredentials = true;
            return config;
        });
        return () => axios.interceptors.request.eject(id);
    }, [accessToken]);

    const value = useMemo(() => ({
        accessToken,
        setAccessToken,
        isAuthenticated: !!accessToken,
        initializing
    }), [accessToken, initializing]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
