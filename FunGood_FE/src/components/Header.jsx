import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

function Header() {

    const location = useLocation();
    const { isAuthenticated, setAccessToken } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post("http://localhost:8080/user/logout", null, {withCredentials: true});

            setAccessToken(null);
            navigate("/");
        } catch(err) {
            console.log("Logout Fail : ", err);
        }
    };

    return (
        <nav className="header">
            <div className="header-top">
                <Link className="header-logo" to='/'>FunGood</Link>
                <div className="header-links">
                    {isAuthenticated ? (
                        <>
                            <button className="logout-btn" onClick={handleLogout}>LOGOUT</button>
                            <Link to='/mypage/home'>MYPAGE</Link>
                        </>
                    ) : (
                        <>
                            <Link to='/user/signup/verify' state={{redirectTo: "/user/signup/insert"}}>SIGNUP</Link>
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
