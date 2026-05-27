package com.example.order_service.helper;

import com.example.order_service.config.jwt.InternalTokenProvider;
import com.example.order_service.dtos.MenuItemInfoDto;
import com.example.order_service.dtos.VoucherInfoDto;
import com.example.shared.dtos.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
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
    public VoucherInfoDto validateVoucher(String voucherId, List<String> vendorIds) {
        Map<String, Object> body = new HashMap<>();
        body.put("voucherId", voucherId);
        body.put("vendorIds", vendorIds);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(tokenProvider.getToken());

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        ParameterizedTypeReference<ApiResponse<VoucherInfoDto>> typeRef = new ParameterizedTypeReference<>() {};

        ResponseEntity<ApiResponse<VoucherInfoDto>> response = restTemplate.exchange(
                getMenuServiceBaseUrl() + "/menu/vouchers/validate",
                HttpMethod.POST,
                entity,
                typeRef);

        return Optional.ofNullable(response.getBody())
                .map(ApiResponse::getData)
                .orElse(null);
    }

    public void updateRemaining(String menuItemId, Integer remaining){
        Map<String, String> body = new HashMap<>();
        body.put("remain", remaining.toString());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(tokenProvider.getToken());

        HttpEntity<Map<String, String>> entity =
                new HttpEntity<>(body, headers);

        ParameterizedTypeReference<ApiResponse<MenuItemInfoDto>> typeRef = new ParameterizedTypeReference<>() {
        };

        ResponseEntity<ApiResponse<MenuItemInfoDto>> response = restTemplate.exchange(
                getMenuServiceBaseUrl() + "/menu/items/update-remaining/" + menuItemId,
                HttpMethod.PUT,
                entity,
                typeRef
        );

    }
}
