package com.fungood.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fungood.dto.user.LoginRequest;
import com.fungood.entity.User;
import com.fungood.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    @Value("${portone.public.store-id}")
    private String portOneStoreId;

    @Value("${portone.public.channel-key}")
    private String portOneChannelKey;

    @Value("${portone.api_secret}")
    private String portOneApiSecret;

    private final UserService userService;

    // 포트원 간편인증 API
    // 간편인증 포트원 정보 반환
    @GetMapping("/portone/verify")
    public ResponseEntity<Map<String, Object>> verify() {
        Map<String, Object> response = new HashMap<>();
        response.put("portOneStoreId", portOneStoreId);
        response.put("portOneChannelKey", portOneChannelKey);

        return ResponseEntity.ok(response);
    }

    // 간편인증 정보 활용해서 사용자 정보 조회 및 인증
    @PostMapping("/portone/verify")
    @ResponseBody
    public ResponseEntity<Map<String, Object>> verifyIdentify(@RequestBody Map<String, String> payload, HttpSession httpSession) {
        Map<String, Object> responseBody = new HashMap<>();

        try {
            String identityVerificationId = payload.get("identityVerificationId");
            String apiUrl = "https://api.portone.io/identity-verifications/" + identityVerificationId;

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();

            headers.set("Authorization", "PortOne " + portOneApiSecret);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.GET, entity, String.class);

            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode root = objectMapper.readTree(response.getBody());

            String status = root.path("status").asText();
            log.info("PortOne 응답 데이터 : {}", response.getBody());

            if (status.equals("VERIFIED")) {
                JsonNode customerNode = root.path("verifiedCustomer");
                String name = customerNode.path("name").asText();
                String phone = customerNode.path("phoneNumber").asText();
                String birth = customerNode.path("birthDate").asText();

                responseBody.put("status", "success");
                responseBody.put("name", name);
                responseBody.put("phone", phone);
                responseBody.put("birth", birth);

                // 세션에 저장하지 말고 컴포넌트로 정보 넘기기
//                httpSession.setAttribute("isVerified", "true");
//                httpSession.setAttribute("verifiedUserName", name);
//                httpSession.setAttribute("verifiedUserName", name);
//                httpSession.setAttribute("verifiedUserName", name);

                return ResponseEntity.ok(responseBody);
            } else {
                String reason = root.path("reason").asText("알 수 없는 오류로 인증 실패");
                responseBody.put("status", "failed");
                responseBody.put("message", reason);
                return ResponseEntity.badRequest().body(responseBody);
            }
        } catch (Exception e) {
            e.printStackTrace();
            responseBody.put("status", "error");
            responseBody.put("message", "인증 처리 도중 서버 오류 발생");
            return ResponseEntity.internalServerError().body(responseBody);
        }
    }

    // 회원가입 API
    @GetMapping("/signup/chkId")
    public ResponseEntity<Boolean> checkId(String userId) {
        // 아이디 중복 검사
        return null;
    }
    
    @GetMapping("/signup/chkEmail")
    public ResponseEntity<Boolean> checkEmail(String email) {
        // 이메일 중복 검사
        return null;
    }
    
    @PostMapping("/signup/insert")
    public ResponseEntity<Map<String, Object>> signupComplete() {
        // 비밀번호 암호화 -> 회원 가입 완료
        return null;
    }

    // 로그인 API
    @GetMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.login(loginRequest);
        return ResponseEntity.ok(Map.of("status", "로그인 성공", "userName", user.getUserName(), "role", user.getUserRole()));
    }
}
