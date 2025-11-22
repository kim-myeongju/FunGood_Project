import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
// 로그인 관련
import LoginPage from './pages/user/LoginPage';
import UserLogin from './components/user/UserLogin';
import UserFindId from './components/user/UserFindId';
import UserChangePw from './components/user/UserChangePw';
// 회원가입 관련
import SignupPage from './pages/user/SignupPage';
import UserVerify from './components/user/UserVerify';
import UserSignup from './components/user/UserSignup';
import AmdinPage from './pages/admin/AdminPage';
import "./css/App.css";
import CategoryPopular from './pages/test/CategoryPopular';
import CategoryNew from './pages/test/CategoryNew';

function App() {

  return (
    <Router>
      <div className='container'>
        <Routes>
          {/* 홈 페이지 */}
          <Route path='/' element={<Home />}>
            <Route path='/category/popular' element={<CategoryPopular />} />
            <Route path='/category/new' element={<CategoryNew />} />
          </Route>

          {/* 회원가입 페이지 */}
          <Route path='/user/signup' element={<SignupPage />}>
            <Route path='/user/signup/verify' element={<UserVerify />} />
            <Route path='/user/signup/insert' element={<UserSignup />} />
          </Route>

          {/* 로그인 페이지 */}
          <Route path='/user/login' element={<LoginPage />}>
            <Route path='/user/login/input' element={<UserLogin />} />
            <Route path='/user/login/verify' element={<UserVerify /> } />
            <Route path='/user/login/changepw' element={<UserChangePw />} />
          </Route>

          {/* 관리자 페이지 */}
          <Route path='/admin' element={<AmdinPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
