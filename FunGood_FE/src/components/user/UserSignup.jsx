// 간편인증 후 회원가입
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function UserSignup() {
  let isIdChecked = false;
  let isEmailChecked = false;
  const location = useLocation();
  const navigate = useNavigate();

  const verifiedData = location.state;

  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');

  // 간편인증으로 넘어온 데이터 자동 입력
  useEffect(() => {
    if (verifiedData) {
      setUserName(verifiedData.name || '');
    }
  }, [verifiedData]);

  const handleIdChk = async (e) => {
    // 아이디 중복 체크
    if (!userId.trim()) {
      alert("ID를 입력해주세요");
      return;
    }

    if (userId.length < 4) {
      alert("ID는 4자리 이상 입력해주세요");
      setUserId('');
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/user/signup/chkId", { userId: userId });
      if (response.data) {
        isIdChecked = true;
        alert("사용가능한 ID입니다.");
      } else {
        alert("이미 사용중인 ID입니다.");
        setUserId('');
        return;
      }

    } catch (err) {
      console.error("ID 중복체크 실패 :", err);
    }
  }

  const handleEmailChk = async (e) => {
    // 이메일 중복 체크
    if (!email.trim()) {
      alert("이메일을 입력해주세요");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email.trim())) {
      alert("올바른 이메일 주소를 입력해주세요.");
      setEmail('');
      return;
    }

    try {
      const response = await axios.post("http://localhost:8080/user/signup/chkEmail", { email: email });
      if (response.data) {
        isEmailChecked = true;
        alert("사용가능한 이메일입니다.");
      } else {
        alert("이미 존재하는 이메일입니다.");
        setEmail('');
        return;
      }

    } catch (err) {
      console.error("ID 중복체크 실패 :", err);
    }
  }

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!userPw.trim()) {
      alert("비밀번호를 입력해주세요");
      return;
    }
    if (userPw.length < 4) {
      alert("비밀번호는 4자리 이상 입력해주세요");
      setUserPw('');
      return;
    }

    if (!isIdChecked && !isEmailChecked) {
      alert("ID 또는 이메일의 중복확인을 먼저 진행해주세요");
      return;
    }

    const requestData = {
      userId,
      userPw,
      userName,
      email,
      phone: verifiedData.phone || '',
      birth: verifiedData.birth || '',
    };

    // 회원가입 요청
    try {
      const response = await axios.post("http://localhost:8080/user/signup/insert", requestData);
      if (response.data.status === 'success') {
        alert("회원가입을 축하드립니다!!");
        navigate("/");
      } else {
        console.error("서버 회원 가입 실패 : ", requestData.error);
      }

    } catch (err) {
      console.error("회원 가입 실패 : ", err);
    }
  }

  return (
    <>
      <form onSubmit={handleSignup}>
        <input
          type="text"
          placeholder="Enter your name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <div className="duplication-chk">
          <input
            type="text"
            placeholder="Enter your ID"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
          <button type="button" onClick={handleIdChk}>중복확인</button>
        </div>
        <input
          type="password"
          placeholder="Enter your password"
          value={userPw}
          onChange={(e) => setUserPw(e.target.value)}
        />
        <div className="duplication-chk">
          <input
            type="text"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="button" onClick={handleEmailChk}>중복확인</button>
        </div>
        <button className="submit-btn" type="submit">회원가입</button>
      </form>
    </>
  )
}

export default UserSignup;
