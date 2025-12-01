// 간편인증 컴포넌트
import axios from "axios";
import * as PortOne from "@portone/browser-sdk/v2";

function UserVerify({ onVerified }) {
  const handleVerify = async () => {
    try {
      // 1. 백엔드에서 포트원 연동 정보 요청
      const { data } = await axios.get("http://localhost:8080/user/portone/verify");
      const { portOneStoreId, portOneChannelKey } = data || {};
      if (!portOneStoreId) throw new Error("portOneStoreId X");

      // 2. 인증 요청용 ID 생성
      const identityVerificationId = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `iv-${Date.now()}-${Math.random().toString(16).slice(2)}`;

      // 3. 포트원 SDK 로드 & 본인인증 요청
      const portoneResponse = await PortOne.requestIdentityVerification({
        storeId: portOneStoreId,
        channelKey: portOneChannelKey,
        identityVerificationId,
      });

      // 포트원 측 오류 or 사용자 취소 처리
      if (portoneResponse?.code) {
        alert(portoneResponse.message || `PortOne Error: ${portoneResponse.code}`);
      }

      // 4. 인증 결과를 서버로 전달하여 최종 검증
      const verifyRes = await axios.post("http://localhost:8080/user/portone/verify", {
        identityVerificationId: portoneResponse.identityVerificationId,
      });

      const userVerifiedData = {
        status: verifyRes.data.status,
        name: verifyRes.data.name,
        phone: verifyRes.data.phone,
        birth: verifyRes.data.birth,
      };

      onVerified?.(userVerifiedData);

    } catch (err) {
      console.error("간편인증 실패: ", err);
    }
  };

  return (
    <>
      <button className="submit-btn" type="button" onClick={handleVerify}>간편인증</button>
    </>
  )
}

export default UserVerify;
