// 로그인 컴포넌트
import axios from "axios";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

function UserLogin() {

    const { setAccessToken } = useContext(AuthContext);
    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');
    const navigate = useNavigate();

    const handleLogin = async(e) => {
        e.preventDefault();

        if(!userId.trim()) {
            alert("아이디를 입력해주세요.");
            return;
        }
        if(!userPw.trim()) {
            alert("비밀번호를 입력해주세요.");
            return;
        }

        try {
            const { data } = await axios.post("http://localhost:8080/user/login", { userId, userPw }, {withCredentials: true});
            const accessToken = data?.access_token;
            if(!accessToken) {
                alert("로그인 처리 오류 : 토큰이 없습니다.");
                return;
            }
            console.log("access_token : ", accessToken);
            setAccessToken(accessToken);
            navigate("/");
        } catch(err) {
            if(err.response) {
                if(err.response.status === 401) {
                    const msg = err.response.data.message || "아이디 또는 패스워드를 확인해주세요!";
                    alert(msg);
                } else {
                    alert(err.response.data.error || "서버에서 오류 발생. 다시 시도해주세요.");
                }
            } else {
                alert("서버에 연결 불가");
            }
        }
    }; 

    return (
        <>
            <form onSubmit={handleLogin}>
                <input 
                    type="text"
                    placeholder="Please enter your ID"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    required
                />
                <input 
                    type="password"
                    placeholder="Please enter your password"
                    value={userPw}
                    onChange={(e) => setUserPw(e.target.value)}
                    required
                />
                <button className="submit-btn" type="submit">로그인</button>
            </form>
        </>
    )
}

export default UserLogin;
