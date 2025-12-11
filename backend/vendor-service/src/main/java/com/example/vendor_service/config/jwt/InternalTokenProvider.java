package com.example.vendor_service.config.jwt;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class InternalTokenProvider {

    private final RestTemplate restTemplate;
    private final DiscoveryClient discoveryClient;

    @Value("${internal-token.service-name}")
    private String serviceName;

    @Value("${internal-token.api-key}")
    private String apiKey;

    @Value("${internal-token.auth-url:}")
    private String authUrl;

    private String cachedToken;
    private long tokenExpiration = 0;

    private String getAuthUrl() {
        if (authUrl != null && !authUrl.isEmpty() && authUrl.startsWith("http")) {
            return authUrl;
        }
        return discoveryClient.getInstances("iam-service")
                .stream()
                .findFirst()
                .map(instance -> instance.getUri().toString())
                .orElseThrow(() -> new RuntimeException("Vendor Service not found")) + "/iam/internal/auth/token";
    }

    public String getToken() {
        long now = System.currentTimeMillis();
        if (cachedToken == null || now >= tokenExpiration) {
            HttpHeaders headers = new HttpHeaders();
            headers.set("x-service-name", serviceName);
            headers.set("x-api-key", apiKey);

            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                    getAuthUrl(), HttpMethod.POST, entity,
                    new ParameterizedTypeReference<Map<String, Object>>() {
                    });

            Map<String, Object> body = response.getBody();
            if (body == null || !body.containsKey("token")) {
                throw new IllegalStateException("Token not found in internal auth response");
            }

            String token = (String) body.get("token");
            cachedToken = token;
            tokenExpiration = now + 5 * 60 * 1000; // Cache 5 phút
        }
        return cachedToken;
    }
}

