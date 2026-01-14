package com.example.menu_service.config;


import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.filter.CorsFilter;

import com.example.shared.config.CorsProperties;
import com.example.shared.config.CustomAccessDeniedHandler;
import com.example.shared.config.CustomAuthenticationEntryPoint;
import com.example.menu_service.config.jwt.JwtAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;
    private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
    private final CorsProperties corsProperties;
    private final DiscoveryClient discoveryClient;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
                          CustomAccessDeniedHandler customAccessDeniedHandler,
                          CustomAuthenticationEntryPoint customAuthenticationEntryPoint,
                          CorsProperties corsProperties,
                          DiscoveryClient discoveryClient) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.customAccessDeniedHandler = customAccessDeniedHandler;
        this.customAuthenticationEntryPoint = customAuthenticationEntryPoint;
        this.corsProperties = corsProperties;
        this.discoveryClient = discoveryClient;
    }

    @Bean
    public CorsFilter corsFilter() {
        return new CorsFilter(request -> {
            String origin = request.getHeader("Origin");
            Set<String> allowedOrigins = new HashSet<>(corsProperties.getAllowedOrigins());

            for (String serviceName : discoveryClient.getServices()) {
                List<ServiceInstance> instances = discoveryClient.getInstances(serviceName);
                for (ServiceInstance instance : instances) {
                    allowedOrigins.add(instance.getUri().toString());
                }
            }

            if (origin != null && allowedOrigins.contains(origin)) {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowedOrigins(List.of(origin));
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("Authorization", "Content-Type",
                        "X-Requested-With", "Accept", "Origin", "Access-Control-Request-Method",
                        "Access-Control-Request-Headers"));
                config.setExposedHeaders(List.of("Authorization", "Content-Type"));
                config.setAllowCredentials(true);
                config.setMaxAge(3600L);
                return config;
            }

            return null;
        });
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(Customizer.withDefaults())
                .sessionManagement(sess -> sess.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**", "/v3/api-docs/**",
                                "/swagger-ui/**", "/swagger-ui.html")
                        .permitAll()
                        .requestMatchers("/ws/**", "/test-notification").permitAll() // test websocket endpoint
                        .anyRequest().authenticated())
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint(customAuthenticationEntryPoint)
                        .accessDeniedHandler(customAccessDeniedHandler))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
