package com.example.order_service.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisTokenService {

    private final RedisTemplate<String, Object> redisTemplate;
    private static final String BLACKLIST_PREFIX = "blacklist:access:";

    public boolean isTokenBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.opsForValue().get(BLACKLIST_PREFIX + token));
    }
}