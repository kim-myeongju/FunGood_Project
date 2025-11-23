package com.fungood.service;

import com.fungood.dto.user.LoginRequest;
import com.fungood.dto.user.SignUpRequest;
import com.fungood.entity.User;
import com.fungood.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

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

    public User login(LoginRequest loginRequest) {
        return userMapper.findUserByUserId(loginRequest.getUserId());
    }
}
