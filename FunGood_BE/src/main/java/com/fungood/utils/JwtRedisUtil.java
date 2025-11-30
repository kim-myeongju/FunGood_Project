package com.fungood.utils;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
@RequiredArgsConstructor
public class JwtRedisUtil {

    private final StringRedisTemplate redisTemplate;
    private static final String PREFIX = "user_id:";

    // stored current login user
    public void saveLoginSession(String userId, String sid, String refreshToken, String loginTime) {
        String script =
                        "local key = KEYS[1]\n" +
                        "local ttl = tonumber(ARGV[4])\n" +
                        "redis.call('HMSET', key,\n" +   // ← HMSET 사용
                        "  'current_sid',   ARGV[1],\n" +
                        "  'refresh_token', ARGV[2],\n" +
                        "  'login_time',    ARGV[3]\n" +
                        ")\n" +
                        "if ttl and ttl > 0 then\n" +
                        "  redis.call('PEXPIRE', key, ttl)\n" +
                        "end\n" +
                        "return 1\n";

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>();
        redisScript.setScriptText(script);
        redisScript.setResultType(Long.class);

        List<String> keys = Collections.singletonList(PREFIX + userId);

        redisTemplate.execute(redisScript, keys, sid, refreshToken, loginTime, String.valueOf(JwtTokenProvider.EXPIRATION_1D));
    }

    public Map<String, String> getLoginUserInfo(String userId) {
        Map<Object, Object> redisData = redisTemplate.opsForHash().entries(PREFIX + userId);
        Map<String, String> result = new HashMap<>();

        if (!redisData.isEmpty()) {
            redisData.forEach((k, v) -> result.put((String) k, (String) v));
        }

        return result;
    }

    public String getSidFromRedis(String userId) {
        Map<String, String > redisData = getLoginUserInfo(userId);
        return redisData.get("current_sid");
    }

    public void deleteLoginSession(String userId) {
        redisTemplate.delete(PREFIX + userId);
    }

}
