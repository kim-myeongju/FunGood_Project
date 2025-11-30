package com.fungood.security;

import com.fungood.entity.User;
import com.fungood.mapper.UserMapper;
import com.fungood.utils.JwtRedisUtil;
import com.fungood.utils.JwtTokenProvider;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Slf4j
@Component
@RequiredArgsConstructor
public class AccessTokenFilter extends OncePerRequestFilter {

    private static final String REFRESH_PATH = "/user/refresh";

    private final JwtTokenProvider jwtTokenProvider;
    private final UserMapper userMapper;
    private final JwtRedisUtil jwtRedisUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        if (REFRESH_PATH.equals(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        String token = jwtTokenProvider.tokenResolver(request.getHeader("Authorization"));
        if (token == null) {
            log.info("토큰 없음 -> 비로그인 상태로 처리");
            filterChain.doFilter(request, response);
            return;
        }

        if (!jwtTokenProvider.validateToken(token)) {
            log.warn("access token invalid");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        String userId = jwtTokenProvider.getUserIdFromToken(token);
        String sidFromToken = jwtTokenProvider.getSidFromToken(token);
        String sidFromRedis = jwtRedisUtil.getSidFromRedis(userId);

        if (sidFromToken == null) {
            log.warn("토큰에 sid 가 없음 -> 변조/만료된 토큰");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        if (sidFromRedis == null) {
            log.warn("Redis 세션 없음 -> 재발급 후 재로그인 시도");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        if (!sidFromRedis.equals(sidFromToken)) {
            log.warn("세션 ID 불일치 (동시 로그인) -> 강제 로그아웃 필요");
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            return;
        }

        User user = userMapper.findUserByUserId(userId);
        if (user != null) {
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(user, null, Collections.singletonList(new SimpleGrantedAuthority(user.getUserRole())));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.info("현재 로그인 사용자 : {}", userId);
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return false;
    }
}
