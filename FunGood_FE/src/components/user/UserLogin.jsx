// 로그인 컴포넌트
import axios from "axios";
import { useState } from "react";

function UserLogin() {

    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');

    const handleLogin = async(e) => {
        // 로그인 시작!
    }

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
