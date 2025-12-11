package com.example.iam_service.controller;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.iam_service.config.jwt.JwtProvider;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/internal/auth")
@RequiredArgsConstructor
public class InternalAuthController {

    private final JwtProvider jwtProvider;

    @Value("${jwt.secret}")
    private String jwtSecret;



    private Map<String, String> serviceKeys;

    @PostConstruct
    public void init() {
        serviceKeys = Map.of(
                "vendor-service", jwtSecret,
                "menu-service", jwtSecret,
                "order-service", jwtSecret
        );
    }

    @PostMapping("/token")
    public ResponseEntity<?> generateInternalToken(
            @RequestHeader("x-service-name") String serviceName,
            @RequestHeader("x-api-key") String apiKey) {

        // Kiểm tra service name
        if (!serviceKeys.containsKey(serviceName)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid service name"));
        }

        // Kiểm tra API key
        if (!serviceKeys.get(serviceName).equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid API key"));
        }

        // Tạo token nội bộ
        String token = jwtProvider.generateInternalToken(serviceName);

        return ResponseEntity.ok(Map.of("token", token));
    }
}
