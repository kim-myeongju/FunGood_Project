// 간편인증 후 회원가입
import axios from "axios";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function UserSignup() {
    const navigate = useNavigate();
    const location = useLocation();

    const verifiedData = location.state;

    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birth, setBirth] = useState('');

    // 간편인증으로 넘어온 데이터 자동 입력
    useEffect(() => {
        if(verifiedData) {
            setUserName(verifiedData.name || '');
            setPhone(verifiedData.phone || '');
            setBirth(verifiedData.birth || '');
        }
    }, [verifiedData]);

    const handleIdChk = async (e) => {
        // 아이디 중복 체크
    }

    const handleEmailChk = async (e) => {
        // 이메일 중복 체크
    }

    const handleSignup = async (e) => {
        e.preventDefault();

        const requestData = {
            userId,
            userPw,
            userName,
            email,
            phone,
            birth,
        };

        // 회원가입 요청
        // try {
        //     const response = await axios.post("http://localhost:8080/user/signup/insert", requestData);

        //     navigate("/");
        // } catch(err) {
        //     console.error("회원 가입 실패 : ", err);
        // }
    }

    return (
        <>
            <form onSubmit={handleSignup}>
                <div className="duplication-chk">
                    <input 
                        type="text"
                        placeholder="Enter your ID"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                    />
                    <button type="button" onClick={handleIdChk}>중복확인</button>
                </div>

                <input 
                    type="password"
                    placeholder="Enter your password"
                    value={userPw}
                    onChange={(e) => setUserPw(e.target.value)}
                    required
                />
                <input 
                    type="text"
                    placeholder="Enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                />
                <div className="duplication-chk">
                    <input 
                        type="text"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <button type="button" onClick={handleEmailChk}>중복확인</button>
                </div>
                <input 
                    type="text"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                />
                <input 
                    type="date"
                    value={birth}
                    onChange={(e) => setBirth(e.target.value)}
                    required
                />
                <button className="submit-btn" type="submit">회원가입</button>
            </form>
        </>
    )
}

export default UserSignup;
