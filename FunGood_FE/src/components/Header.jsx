import { Link, useLocation } from "react-router-dom";

function Header() {

    const location = useLocation();

    return (
        <nav className="header">
            <div className="header-top">
                <Link className="header-logo" to='/'>FunGood</Link>
                <div className="header-links">
                    <Link to='/user/signup/verify'>SIGNUP</Link>
                    <Link to='/user/login/input'>LOGIN</Link>
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
