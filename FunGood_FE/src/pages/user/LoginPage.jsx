// 로그인 컴포넌트
import { Link } from "react-router-dom";
import { Outlet } from "react-router-dom";
import "../../css/page/user/User.css";

function LoginPage() {

  return (
    <div className="user-container">
      <div className="user-box">
        <h2>Login</h2>
        <Outlet />
        <div className="go-to-link">
          <Link className="user-font" to='/'>홈으로</Link>
          <Link className="user-font" to='/user/login/verify' state={{ redirectTo: "/user/login/findid" }}>아이디찾기</Link>
          <Link className="user-font" to='/user/login/changepw'>비밀번호변경</Link>
        </div>
      </div>
    </div>
  )
}

export default LoginPage;
