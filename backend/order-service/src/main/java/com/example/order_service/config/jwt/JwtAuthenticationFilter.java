package com.example.order_service.config.jwt;

import com.example.order_service.config.jwt.JwtProvider;
import com.example.order_service.service.RedisTokenService;
import com.example.shared.config.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final RedisTokenService redisTokenService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);

            try {
                // ✅ Blacklist check
                if (redisTokenService.isTokenBlacklisted(token)) {
                    throw new JwtException("Token is blacklisted");
                }

                // ✅ Token validation
                if (!jwtProvider.validateToken(token)) {
                    throw new JwtException("Token is invalid or expired");
                }

                Claims claims = jwtProvider.getClaims(token);
                String tokenType = claims.get("type", String.class);

                /* =========================================
                    INTERNAL SERVICE TOKEN
                   ========================================= */
                if ("INTERNAL_SERVICE".equals(tokenType)) {

                    CustomUserDetails userDetails = new CustomUserDetails(
                            null,
                            claims.get("service", String.class),
                            null,
                            true,
                            "INTERNAL_SERVICE"     // ✅ single role string
                    );

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    java.util.List.of(new SimpleGrantedAuthority("ROLE_INTERNAL_SERVICE"))
                            );

                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    filterChain.doFilter(request, response);
                    return;
                }

                /* =========================================
                    OTP TOKEN (reset-password)
                   ========================================= */
                if ("otp".equals(tokenType)
                        && request.getRequestURI().equals("/iam/auth/reset-password")) {

                    CustomUserDetails userDetails = new CustomUserDetails(
                            null,
                            claims.getSubject(),
                            null,
                            true,
                            "OTP_USER"              // ✅ single role string
                    );

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    java.util.List.of(new SimpleGrantedAuthority("ROLE_OTP_USER"))
                            );

                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);

                    filterChain.doFilter(request, response);
                    return;
                }

                /* =========================================
                    ACCESS TOKEN
                   ========================================= */
                if ("access".equals(tokenType)) {

                    String userId = claims.getSubject();
                    String email  = claims.get("email", String.class);
                    String role   = claims.get("role", String.class);  // ✅ now string



                    CustomUserDetails userDetails = new CustomUserDetails(
                            userId,
                            email,
                            null,
                            true,
                            role                       // ✅ single role string
                    );

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(
                                    userDetails,
                                    null,
                                    java.util.List.of(new SimpleGrantedAuthority("ROLE_" + role))
                            );

                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }

            } catch (JwtException ex) {
                SecurityContextHolder.clearContext();
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write(
                        "{\"status\":401,\"message\":\"Unauthorized: " + ex.getMessage() + "\",\"data\":null}"
                );
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
