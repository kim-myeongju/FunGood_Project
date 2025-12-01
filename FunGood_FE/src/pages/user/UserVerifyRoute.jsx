// 간편인증 후 컴포넌트 렌더링

import { useLocation, useNavigate } from "react-router-dom";
import UserVerify from "../../components/user/UserVerify";
import axios from "axios";

const SAFE_PATH = new Set([
  "/user/signup/insert",
  "/user/login/findid",
  "/user/login/changepw",
]);

function safeNext(next) {
  if (typeof next !== "string") return null;
  if (!next.startsWith("/")) return null;
  return SAFE_PATH.has(next) ? next : null;
}

function UserVerifyRoute({ mode = "signup" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);

  const defaultDest =
    mode === "signup"
      ? "/user/signup/insert"
      : mode === "findid"
        ? "/user/login/findid"
        : mode === "changepw"
          ? "/user/login/changepw"
          : "/user/login/input";

  const dest =
    safeNext(params.get("next")) ||
    safeNext(location.state?.redirectTo) ||
    defaultDest;

  console.log(dest);

  return (
    <UserVerify
      onVerified={async (verified) => {
        // 회원가입 시 간편인증 실행 후 이미 가입된 유저인지 확인
        if (dest.includes('/user/signup/insert')) {
          const existRes = await axios.get("http://localhost:8080/user/portone/is-exist", { params: { phone: verified.phone } });
          const isExistUser = existRes.data;
          if (isExistUser) {
            alert("이미 가입된 사용자입니다. 로그인 페이지로 이동합니다.");
            navigate("/user/login/input", { replace: true });
            return;
          }
        }

        navigate(dest, { state: verified, replace: true });
      }}
    />
  );
}

export default UserVerifyRoute;
