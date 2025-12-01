import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useState } from "react";
import { AuthContext } from "../context/AuthContext";

function Header() {

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async (e) => {
    e.preventDefault();
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await logout();
      navigate("/", { replace: true });
    } catch (err) {
      console.log("Logout Fail : ", err);
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <nav className="header">
      <div className="header-top">
        <Link className="header-logo" to='/'>FunGood</Link>
        <div className="header-links">
          {isAuthenticated ? (
            <>
              <button className="logout-btn" type="button" onClick={handleLogout}>LOGOUT</button>
              <Link to='/mypage/home'>MYPAGE</Link>
            </>
          ) : (
            <>
              <Link to='/user/signup/verify' state={{ redirectTo: "/user/signup/insert" }}>SIGNUP</Link>
              <Link to='/user/login/input'>LOGIN</Link>
            </>
          )}
        </div>
      </div>

      <div className="header-bottom">
        <div className="header-links">
          <Link className={location.pathname === '/category/popular' ? "active" : ""} to='/category/popular'>인기프로젝트</Link>
          <Link className={location.pathname === '/category/new' ? "active" : ""} to='/category/new'>신규프로젝트</Link>
          <Link className={location.pathname === '/category' ? "active" : ""} to='/category'>다이어리</Link>
          <Link className={location.pathname === '/category' ? "active" : ""} to='/category'>달력</Link>
          <Link className={location.pathname === '/category' ? "active" : ""} to='/category'>디퓨저/향수</Link>
        </div>
      </div>
    </nav>
  )
}

export default Header;
