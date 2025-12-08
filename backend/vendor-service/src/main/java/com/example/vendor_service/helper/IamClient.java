package com.example.vendor_service.helper;


import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import com.example.shared.dtos.ApiResponse;
import com.example.vendor_service.config.jwt.InternalTokenProvider;
import com.example.vendor_service.dtos.UserInfoDto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class IamClient {

    private final RestTemplate restTemplate;
    private final InternalTokenProvider tokenProvider;
    private final DiscoveryClient discoveryClient;

    @Value("${iam-service.url:}")
    private String serviceUrl;

    private String getIAMServiceBaseUrl() {
        if (serviceUrl != null && !serviceUrl.isEmpty()) {
            return serviceUrl;
        }
        return discoveryClient.getInstances("iam-service")
                .stream()
                .findFirst()
                .map(instance -> instance.getUri().toString())
                .orElseThrow(() -> new RuntimeException("IAM Service not found"));
    }

    public UserInfoDto getUserInfo(String userId) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tokenProvider.getToken());
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        ParameterizedTypeReference<ApiResponse<UserInfoDto>> typeRef = new ParameterizedTypeReference<>() {
        };

        ResponseEntity<ApiResponse<UserInfoDto>> response = restTemplate.exchange(
                getIAMServiceBaseUrl() + "/iam/users/" + userId,
                HttpMethod.GET,
                entity,
                typeRef);

        return Optional.ofNullable(response.getBody())
                .map(ApiResponse::getData)
                .orElse(null);

    }

    public Map<String, UserInfoDto> getUsersByIds(Collection<String> ids) {
        if (ids == null || ids.isEmpty()) return Collections.emptyMap();

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(tokenProvider.getToken());
        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Build the URL with query parameters for each ID
        UriComponentsBuilder builder = UriComponentsBuilder
                .fromUriString(getIAMServiceBaseUrl() + "/iam/users/list-users");
        ids.forEach(id -> builder.queryParam("ids", id));

        ParameterizedTypeReference<ApiResponse<List<UserInfoDto>>> typeRef = new ParameterizedTypeReference<>() {
        };

        ResponseEntity<ApiResponse<List<UserInfoDto>>> response = restTemplate.exchange(
                builder.toUriString(),
                HttpMethod.GET,
                entity,
                typeRef);

        List<UserInfoDto> users = Optional.ofNullable(response.getBody())
                .map(ApiResponse::getData)
                .orElse(Collections.emptyList());

        return users.stream().collect(Collectors.toMap(UserInfoDto::getUserId, Function.identity()));
    }


    public void assignVendor(String vendorId, String email){
        Map<String, String> body = new HashMap<>();
        body.put("email", email);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(tokenProvider.getToken());

        HttpEntity<Map<String, String>> entity =
                new HttpEntity<>(body, headers);

        ParameterizedTypeReference<ApiResponse<UserInfoDto>> typeRef = new ParameterizedTypeReference<>() {
        };

        ResponseEntity<ApiResponse<UserInfoDto>> response = restTemplate.exchange(
                getIAMServiceBaseUrl() + "/iam/users/assign-vendor/" + vendorId,
                HttpMethod.PUT,
                entity,
                typeRef
        );

    }

}
