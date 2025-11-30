package com.fungood.controller;

import com.fungood.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@Controller
@RequestMapping("/mypage")
@RequiredArgsConstructor
public class MyPageController {

    @GetMapping("/home")
    public ResponseEntity<Map<String, Object>> myPageHome(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(Map.of("message", "my page home", "name", user.getUserName()));
    }

}
