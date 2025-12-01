import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LogoutOnlyRoute from './routes/LogoutOnlyRoute';

import UserVerifyRoute from './pages/user/UserVerifyRoute';

// 홈 메인 페이지
import Home from './pages/Home';
import CategoryPopular from './pages/test/CategoryPopular';
import CategoryNew from './pages/test/CategoryNew';

// 로그인
import LoginPage from './pages/user/LoginPage';
import UserLogin from './components/user/UserLogin';
import UserFindId from './components/user/UserFindId';
import UserChangePw from './components/user/UserChangePw';

// 회원가입
import SignupPage from './pages/user/SignupPage';
import UserSignup from './components/user/UserSignup';

// 마이페이지
import MyPage from './pages/mypage/MyPage';

// 관리자
import AdminPage from './pages/admin/AdminPage';

import "./css/App.css";

function App() {

  return (
    <AuthProvider>
      <Router>
        <div className='container'>
          <Routes>
            {/* 공개 라우트 */}
            <Route path='/' element={<Home />}>
              <Route path='/category/popular' element={<CategoryPopular />} />
              <Route path='/category/new' element={<CategoryNew />} />
            </Route>

            {/* 로그인/회원가입은 로그인 상태면 접근 못 하도록 */}
            <Route element={<LogoutOnlyRoute />}>
              <Route path='/user/login' element={<LoginPage />}>
                <Route index element={<Navigate to="input" replace />} />
                <Route path='input' element={<UserLogin />} />
                <Route path='verify' element={<UserVerifyRoute mode="login" />} />
                <Route path='findid' element={<UserFindId />} />
                <Route path='changepw' element={<UserChangePw />} />
              </Route>

              <Route path='/user/signup' element={<SignupPage />}>
                <Route index element={<Navigate to="verify" replace />} />
                <Route path='verify' element={<UserVerifyRoute mode="signup" />} />
                <Route path='insert' element={<UserSignup />} />
              </Route>
            </Route>

            {/* 보호 라우트 (엑세스 토큰 없으면 /user/login 으로 이동) */}
            <Route element={<ProtectedRoute requireRoles={["ROLE_ADMIN"]} />}>
              <Route path="/admin" element={<AdminPage />} />
            </Route>

            <Route element={<ProtectedRoute requireRoles={["ROLE_USER", "ROLE_ADMIN"]} />}>
              <Route path="/mypage/home" element={<MyPage />} />
              {/* 로그인 필요 페이지들 추가 */}
            </Route>
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App
