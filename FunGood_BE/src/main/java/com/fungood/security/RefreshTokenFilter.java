package com.fungood.security;

import com.fungood.entity.User;
import com.fungood.utils.CookieUtil;
import com.fungood.utils.ValidateUserInfo;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class RefreshTokenFilter extends OncePerRequestFilter {
    private final ValidateUserInfo validateUserInfo;
    private final CookieUtil cookieUtil;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication != null && authentication.getPrincipal() instanceof User user) {
            String userId = user.getUserId();
            String refreshTokenFromCookie = cookieUtil.getCookieValue(request, "refresh_token");
            String loginTimeFromCookie = cookieUtil.getCookieValue(request, "login_time");
            boolean valid = validateUserInfo.validateRefreshTokenInfo(refreshTokenFromCookie, loginTimeFromCookie, userId);

            if (!valid) {
                log.info("refresh token 무효");
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return false;
    }
}
