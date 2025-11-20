package com.example.iam_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RedisTokenService {

    private final RedisTemplate<String, Object> redisTemplate;

    private static final String BLACKLIST_PREFIX = "blacklist:access:";
    private static final String REFRESH_PREFIX = "refresh:";

    // ??a access token vào blacklist
    public void blacklistToken(String token, Duration duration) {
        redisTemplate.opsForValue().set(BLACKLIST_PREFIX + token, true, duration);
    }

    // Ki?m tra access token có trong blacklist không
    public boolean isTokenBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.opsForValue().get(BLACKLIST_PREFIX + token));
    }

    // L?u refresh token: theo email + jti (rotation support)
    public void storeRefreshToken(String email, String jti, String token, Duration duration) {
        String key = REFRESH_PREFIX + email + ":" + jti;
        redisTemplate.opsForValue().set(key, token, duration);
    }

    // Ki?m tra refresh token h?p l? (ch?ng reuse)
    public boolean isValidRefreshToken(String email, String jti, String token) {
        String key = REFRESH_PREFIX + email + ":" + jti;
        Object stored = redisTemplate.opsForValue().get(key);
        return token.equals(stored);
    }

    // Xoá refresh token theo email + jti (logout, rotation)
    public void deleteRefreshToken(String email, String jti) {
        String key = REFRESH_PREFIX + email + ":" + jti;
        redisTemplate.delete(key);
    }

    // Xoá t?t c? refresh token c?a user (force logout all)
    public void deleteAllRefreshTokens(String email) {
        String pattern = REFRESH_PREFIX + email + ":*";
        redisTemplate.keys(pattern).forEach(redisTemplate::delete);
    }
}