// 간편인증 후 회원가입
import { Outlet } from "react-router-dom";
import { Link } from "react-router-dom";
import "../../css/page/user/User.css";

function SignupPage() {

  return (
    <div className="user-container">
      <div className="user-box">
        <h2>Sign Up</h2>
        <Outlet />
        <div className="go-to-link">
          <Link className="user-font" to='/'>홈으로</Link>
        </div>
      </div>
    </div>
  )
}

export default SignupPage;
