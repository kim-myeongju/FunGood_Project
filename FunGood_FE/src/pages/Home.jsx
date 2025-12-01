import Header from "../components/Header";
import Footer from "../components/Footer";
import { Outlet } from "react-router-dom";
import "../css/page/Home.css";
import "../css/component/Header.css";
import "../css/component/Footer.css";

function Home() {

  return (
    <div>
      <Header />

      <div className="home-container">
        {/* 콘텐츠 영역 */}
        <Outlet />
      </div>

      <Footer />
    </div>
  )
}

export default Home;
