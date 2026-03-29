package com.example.order_service.helper;

import com.example.order_service.config.jwt.InternalTokenProvider;
import com.example.order_service.dtos.MenuItemInfoDto;
import com.example.shared.dtos.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class MenuClient {
    private final RestTemplate restTemplate;
    private final InternalTokenProvider tokenProvider;
    private final DiscoveryClient discoveryClient;

    @Value("${menu-service.url:}")
    private String serviceUrl;

    private String getMenuServiceBaseUrl() {
        if (serviceUrl != null && !serviceUrl.isEmpty()) {
            return serviceUrl;
        }
        return discoveryClient.getInstances("menu-service")
                .stream()
                .findFirst()
                .map(instance -> instance.getUri().toString())
                .orElseThrow(() -> new RuntimeException("Menu Service not found"));
    }

    public MenuItemInfoDto getItemInfo(String menuItemId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tokenProvider.getToken());
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ParameterizedTypeReference<ApiResponse<MenuItemInfoDto>> typeRef = new ParameterizedTypeReference<>() {
        };

        ResponseEntity<ApiResponse<MenuItemInfoDto>> response = restTemplate.exchange(
                getMenuServiceBaseUrl() + "/menu/items/" + menuItemId,
                HttpMethod.GET,
                entity,
                typeRef);

        return Optional.ofNullable(response.getBody())
                .map(ApiResponse::getData)
                .orElse(null);

    }
}
