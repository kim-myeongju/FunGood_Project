package com.fungood.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fungood.dto.user.LoginRequest;
import com.fungood.dto.user.LoginResponse;
import com.fungood.dto.user.SignUpRequest;
import com.fungood.entity.User;
import com.fungood.exception.LoginException;
import com.fungood.service.UserService;
import com.fungood.utils.CookieUtil;
import com.fungood.utils.JwtRedisUtil;
import com.fungood.utils.JwtTokenProvider;
import com.fungood.utils.ValidateUserInfo;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.context.SecurityContextHolder;
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
    private final CookieUtil cookieUtil;
    private final JwtRedisUtil jwtRedisUtil;
    private final JwtTokenProvider jwtTokenProvider;
    private final ValidateUserInfo validateUserInfo;

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
    @PostMapping("/signup/chkId")
    public ResponseEntity<Boolean> checkId(@RequestBody Map<String, String> body) {
        // 아이디 중복 검사
        boolean isIdAvailable = false;
        String findUserId = userService.getUserIdById(body.get("userId"));

        if (findUserId == null) {
            isIdAvailable = true;
        }

        return ResponseEntity.ok(isIdAvailable);
    }
    
    @PostMapping("/signup/chkEmail")
    public ResponseEntity<Boolean> checkEmail(@RequestBody Map<String, String> body) {
        // 이메일 중복 검사
        boolean isEmailAvailable = false;
        String findUserEmail = userService.getUserEmailByEmail(body.get("email"));

        if (findUserEmail == null) {
            isEmailAvailable = true;
        }

        return ResponseEntity.ok(isEmailAvailable);
    }
    
    @PostMapping("/signup/insert")
    public ResponseEntity<Map<String, Object>> signupComplete(@RequestBody SignUpRequest request) {
        // 비밀번호 암호화 -> 회원 가입 완료
        int res = userService.insertUser(request);

        Map<String, Object> responseBody = new HashMap<>();

        if (res > 0) {
            responseBody.put("status", "success");
            responseBody.put("userName", request.getUserName());
            return ResponseEntity.ok(responseBody);
        } else {
            responseBody.put("error", "회원가입 실패");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(responseBody);
        }
    }

    // 회원가입 시 간편인증 후 유저가 존재하는지 확인
    @GetMapping("/portone/is-exist")
    public ResponseEntity<Boolean> isExistUser(@RequestParam String phone) {
        boolean isExist = false;
        User user = userService.getUserByPhone(phone);

        if (user != null) {
            isExist = true;
        }

        return ResponseEntity.ok(isExist);
    }

    // Login API
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {

        try {
            LoginResponse loginResponse = userService.login(loginRequest);

            // user login info saved in cookie
            cookieUtil.createCookie(response, "current_sid", loginResponse.getSid());
            cookieUtil.createCookie(response, "refresh_token", loginResponse.getRefreshToken());
            cookieUtil.createCookie(response, "login_time", loginResponse.getLoginTime());
            
            log.info("사용자 세션 쿠키에 저장 완료");

            return ResponseEntity.ok(Map.of("status", "success", "access_token", loginResponse.getAccessToken()));
        } catch (LoginException le) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("code", "INVALID_CREDENTIALS", "message", le.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("error", "로그인 처리 중 에러 발생", "reason", e.getMessage()));
        }
    }

    @PostMapping("logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestHeader(value="Authorization", required = false) String accessToken, @CookieValue(value="login_time") String loginTime, HttpServletResponse response) {
        String userId = null;

        try {
            String token = jwtTokenProvider.tokenResolver(accessToken);
            userId = jwtTokenProvider.getUserIdFromToken(token);
        } catch (Exception e) {
            log.warn("엑세스 토큰 파싱 실패, 로그아웃 계속 진행");
        }

        if (userId != null) {
            userService.logout(userId);
        }

        String[] cookieNames = {"current_sid", "refresh_token", "login_time"};
        for (String name : cookieNames) {
            cookieUtil.deleteCookie(response, name);
        }

        SecurityContextHolder.clearContext();
        
        log.info("로그아웃 성공");

        return ResponseEntity.ok(Map.of("status", "success", "message", "로그아웃 성공"));
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate() {
        // 로그인 상태 검증
        return null;
    }

    // 엑세스 토큰 재발급
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = cookieUtil.getCookieValue(request, "refresh_token");

        if (refreshToken == null || !jwtTokenProvider.validateToken(refreshToken)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "refresh token 만료"));
        }

        String userId = jwtTokenProvider.getUserIdFromToken(refreshToken);
        String refreshTokenFromCookie = cookieUtil.getCookieValue(request, "refresh_token");
        String loginTimeFromCookie = cookieUtil.getCookieValue(request, "login_time");
        boolean valid = validateUserInfo.validateRefreshTokenInfo(refreshTokenFromCookie, loginTimeFromCookie, userId);

        if (!valid) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "refresh token 검증 실패"));
        }

        User user = userService.getUserByUserId(userId);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "사용자가 없음"));
        }

        String sid = jwtRedisUtil.getSidFromRedis(userId);

        String newAccessToken = jwtTokenProvider.generateAccessToken(userId, sid);

        log.info("{} : access token refresh OK!", user.getUserId());

        return ResponseEntity.ok(Map.of("status", "success", "access_token", newAccessToken));
    }
}
