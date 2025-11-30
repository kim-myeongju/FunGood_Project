package com.fungood.utils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.Objects;

@Slf4j
@Component
@RequiredArgsConstructor
public class ValidateUserInfo {

    private final JwtRedisUtil jwtRedisUtil;
    private final JwtTokenProvider jwtTokenProvider;

    public boolean validateRefreshTokenInfo(String refreshTokenFromCookie, String loginTimeFromCookie, String userId) {
        Map<String, String> redisData = jwtRedisUtil.getLoginUserInfo(userId);

        if (redisData == null || redisData.isEmpty()) {
            log.warn("Redis 에 저장된 데이터가 없음");
            return false;
        }

        String refreshTokenFromRedis = redisData.get("refresh_token");
        String loginTimeFromRedis = redisData.get("login_time");

        if (refreshTokenFromRedis != null && !jwtTokenProvider.validateToken(refreshTokenFromRedis)) {
            log.warn("refresh token 만료 -> 로그아웃 필요");
            return false;
        }

        if (!Objects.equals(refreshTokenFromCookie, refreshTokenFromRedis) || !Objects.equals(loginTimeFromCookie, loginTimeFromRedis)) {
            log.warn("다른 기기에서 로그인 -> 현재 기기 로그아웃 필요");
            return false;
        }

        return true;
    }
}
