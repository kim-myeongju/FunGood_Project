import { useContext, useEffect } from "react";
import { useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

function MyPage() {

    const {accessToken} = useContext(AuthContext);
    const [userName, setUserName] = useState(null);

    useEffect(() => {
        const handleMyPage = async () => {
            try {
                const response = await axios.get("http://localhost:8080/mypage/home", {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                    withCredentials: true
                });

                setUserName(response.data.name);
            } catch(err) {
                console.error("마이페이지 유저 정보 로딩 실패");
            }
        };

        if(accessToken) {
            handleMyPage();
        }
    }, [accessToken]);


    return (
        <div>
            <h2>마이페이지</h2>
            <p>안녕하세요! <b>{userName}</b>님!</p>
        </div>
    )
}

export default MyPage;
