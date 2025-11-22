// 간편인증 후 회원가입
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function UserSignup() {
    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [birth, setBirth] = useState('');

    const handleSignup = async (e) => {

    }

    return (
        <>
            <form onSubmit={handleSignup}>
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
                <input 
                    type="text"
                    placeholder="Please enter your name"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    required
                />
                <input 
                    type="text"
                    placeholder="Please enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input 
                    type="text"
                    placeholder="Please enter your phone number"
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
                <button type="submit">회원가입</button>
            </form>
        </>
    )
}

export default UserSignup;
