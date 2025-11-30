package com.fungood.service;

import com.fungood.dto.user.LoginRequest;
import com.fungood.dto.user.LoginResponse;
import com.fungood.dto.user.SignUpRequest;
import com.fungood.entity.User;
import com.fungood.exception.LoginException;
import com.fungood.mapper.UserMapper;
import com.fungood.utils.JwtRedisUtil;
import com.fungood.utils.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final JwtRedisUtil jwtRedisUtil;

    public User getUserByUserId(String userId) {
        return userMapper.findUserByUserId(userId);
    }

    public String getUserIdById(String id) {
        String userId = null;
        User user = userMapper.findUserByUserId(id);
        if (user != null) {
            userId = user.getUserId();
        }

        return userId;
    }

    public String getUserEmailByEmail(String email) {
        String userEmail = null;
        User user = userMapper.findUserByEmail(email);
        if (user != null) {
            userEmail = user.getEmail();
        }

        return userEmail;
    }

    public User getUserByPhone(String phone) {
        return userMapper.findUserByPhone(phone);
    }

    public int insertUser(SignUpRequest user) {

        String encodedPassword = passwordEncoder.encode(user.getUserPw());
        user.setUserPw(encodedPassword);

        return userMapper.insertUser(user);
    }

    public LoginResponse login(LoginRequest loginRequest) {
        User user = userMapper.findUserByUserId(loginRequest.getUserId());

        if(user == null) {
            throw new LoginException("존재하지 않는 아이디입니다.");
        }

        if (!passwordEncoder.matches(loginRequest.getUserPw(), user.getUserPw())) {
            throw new LoginException("비밀번호가 일치하지 않습니다.");
        }

        String sid = UUID.randomUUID().toString();
        String accessToken = jwtTokenProvider.generateAccessToken(user.getUserId(), sid);
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getUserId());
        String loginTime = String.valueOf(System.currentTimeMillis());

        // user's login session saved in redis
        jwtRedisUtil.saveLoginSession(user.getUserId(), sid, refreshToken, loginTime);
        log.info("사용자 로그인 세션 Redis 에 저장 완료");

        return new LoginResponse(sid, accessToken, refreshToken, loginTime);
    }

    public void logout(String userId) {
        jwtRedisUtil.deleteLoginSession(userId);
    }
}
