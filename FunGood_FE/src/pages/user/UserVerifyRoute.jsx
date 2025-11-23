// 간편인증 후 컴포넌트 렌더링

import { useLocation, useNavigate } from "react-router-dom";
import UserVerify from "../../components/user/UserVerify";
import axios from "axios";

const routeMap = {
    signup: "/user/signup/insert",      // 회원가입 입력 페이지
    findid: "/user/login/findid",       // 아이디 찾기 페이지
    changepw: "/user/login/changepw",   // 비밀번호 변경 입력 페이지
}

function safeNext(next) {
    if(typeof next !== "string") return null;
    return next.startsWith("/") ? next : null;
}

function UserVerifyRoute() {
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);

    const nextFromQuery = safeNext(params.get("next"));
    const nextFromState = safeNext(location.state?.redirectTo);
    const fallbackSignup = routeMap.signup;
    const fallbackFindid = routeMap.findid;
    const fallbackChangepw = routeMap.changepw;
    const dest = nextFromQuery || nextFromState || fallbackSignup || fallbackFindid || fallbackChangepw;
    console.log(dest);

    return (
        <UserVerify
            onVerified={async (verified) => {
                // 회원가입 시 간편인증 실행 후 이미 가입된 유저인지 확인
                if(dest.includes('/user/signup/insert')) {
                    const existRes = await axios.get("http://localhost:8080/user/portone/is-exist", {params: {phone: verified.phone}});
                    const isExistUser = existRes.data;
                    if(isExistUser) {
                        alert("이미 가입된 사용자입니다. 로그인 페이지로 이동합니다.");
                        navigate("/user/login/input");
                        return;
                    }
                }

                navigate(dest, {state: verified, replace: true});
            }}
        />
    );
}

export default UserVerifyRoute;
