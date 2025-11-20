package com.example.iam_service.config;

import java.util.List;

import com.example.shared.config.CustomAccessDeniedHandler;
import com.example.shared.config.CustomAuthenticationEntryPoint;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.filter.CorsFilter;

import com.example.iam_service.config.jwt.JwtAuthenticationFilter;
import com.example.iam_service.service.CustomUserDetailsService;
import com.example.shared.config.CorsProperties;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {
	private final JwtAuthenticationFilter jwtAuthenticationFilter;
	private final CustomAccessDeniedHandler customAccessDeniedHandler;
	private final CustomAuthenticationEntryPoint customAuthenticationEntryPoint;
	private final CustomUserDetailsService customUserDetailsService;
	private final CorsProperties corsProperties;

	public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter,
						  CustomAccessDeniedHandler customAccessDeniedHandler,
						  CustomAuthenticationEntryPoint customAuthenticationEntryPoint,
						  CustomUserDetailsService customUserDetailsService,
						  CorsProperties corsProperties) {
		this.jwtAuthenticationFilter = jwtAuthenticationFilter;
		this.customAccessDeniedHandler = customAccessDeniedHandler;
		this.customAuthenticationEntryPoint = customAuthenticationEntryPoint;
		this.customUserDetailsService = customUserDetailsService;
		this.corsProperties = corsProperties;
	}

	@Bean
	public CorsFilter corsFilter() {
		return new CorsFilter(request -> {
			String origin = request.getHeader("Origin");
			List<String> allowedOrigins = corsProperties.getAllowedOrigins();

			if (origin != null && allowedOrigins.contains(origin)) {
				CorsConfiguration config = new CorsConfiguration();
				config.setAllowedOrigins(List.of(origin));
				config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
				config.setAllowedHeaders(List.of("Authorization", "Content-Type",
						"X-Requested-With", "Accept", "Origin",
						"Access-Control-Request-Method", "Access-Control-Request-Headers"));
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
						.requestMatchers("/auth/**").permitAll()
						.requestMatchers("/internal/auth/token").permitAll()
						.requestMatchers(
								"/api/auth/**", "/v3/api-docs/**",
								"/swagger-ui/**", "/swagger-ui.html")
						.permitAll()
						.anyRequest().authenticated())
				.exceptionHandling(exception -> exception
						.authenticationEntryPoint(customAuthenticationEntryPoint)
						.accessDeniedHandler(customAccessDeniedHandler))
				.userDetailsService(customUserDetailsService)
				.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

		return http.build();
	}

	@Bean
	public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
		return config.getAuthenticationManager();
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return new BCryptPasswordEncoder();
	}
}