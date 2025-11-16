package com.fungood.service;

import com.fungood.dto.LoginRequest;
import com.fungood.entity.User;
import com.fungood.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserMapper userMapper;

    public User login(LoginRequest loginRequest) {
        return userMapper.findUserByUserId(loginRequest.getUserId());
    }
}
