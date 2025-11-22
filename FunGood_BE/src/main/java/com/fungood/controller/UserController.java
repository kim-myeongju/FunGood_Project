package com.fungood.controller;

import com.fungood.dto.user.LoginRequest;
import com.fungood.dto.user.SignUpRequest;
import com.fungood.entity.User;
import com.fungood.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup() {
        // 회원가입 첫 요청 포트원 데이터 반환
        return null;
    }
    
    @PostMapping("/signup/verify")
    public ResponseEntity<Map<String, Object>> verifyIdentify() {
        // 간편인증 정보 활용해서 사용자 정보 조회 및 인증
        return null;
    }
    
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

    @GetMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest loginRequest) {
        User user = userService.login(loginRequest);
        return ResponseEntity.ok(Map.of("status", "로그인 성공", "userName", user.getUserName(), "role", user.getUserRole()));
    }
}
