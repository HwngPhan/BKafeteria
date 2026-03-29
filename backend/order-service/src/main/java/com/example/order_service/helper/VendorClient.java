package com.example.order_service.helper;

import com.example.order_service.config.jwt.InternalTokenProvider;
import com.example.order_service.dtos.MenuItemInfoDto;
import com.example.order_service.dtos.VendorInfoDto;
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
public class VendorClient {
    private final RestTemplate restTemplate;
    private final InternalTokenProvider tokenProvider;
    private final DiscoveryClient discoveryClient;

    @Value("${vendor-service.url:}")
    private String serviceUrl;

    private String getVendorServiceBaseUrl() {
        if (serviceUrl != null && !serviceUrl.isEmpty()) {
            return serviceUrl;
        }
        return discoveryClient.getInstances("vendor-service")
                .stream()
                .findFirst()
                .map(instance -> instance.getUri().toString())
                .orElseThrow(() -> new RuntimeException("Vendor Service not found"));
    }

    public VendorInfoDto getVendorInfo(String vendorId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tokenProvider.getToken());
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ParameterizedTypeReference<ApiResponse<VendorInfoDto>> typeRef = new ParameterizedTypeReference<>() {
        };

        ResponseEntity<ApiResponse<VendorInfoDto>> response = restTemplate.exchange(
                getVendorServiceBaseUrl() + "/vendor/vendors/" + vendorId,
                HttpMethod.GET,
                entity,
                typeRef);

        return Optional.ofNullable(response.getBody())
                .map(ApiResponse::getData)
                .orElse(null);

    }

}
