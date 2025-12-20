package com.example.vendor_service.config.jwt;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
@Slf4j
public class JwtProvider {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.access.expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh.expiration}")
    private long refreshTokenExpiration;

    @Value("${jwt.otp.expiration}")
    private long otpTokenExpiration;

    @Value("${jwt.account.expiration}")
    private long accountTokenExpiration;

    private Key key;

    @PostConstruct
    public void init() {
        key = Keys.hmacShaKeyFor(secret.getBytes());
    }

    // ✅ ACCESS TOKEN (role is a string, no privileges)
    public String generateAccessToken(String userId, String email, String role) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("type", "access")
                .claim("email", email)
                .claim("role", role)        // ✅ Now role is only a String
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ REFRESH TOKEN
    public String generateRefreshToken(String userId, String email, String jti) {
        return Jwts.builder()
                .setSubject(userId)
                .claim("email", email)
                .setId(jti)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + refreshTokenExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ INTERNAL SERVICE TOKEN
    public String generateInternalToken(String serviceName) {
        return Jwts.builder()
                .setSubject("internal-call")
                .claim("type", "INTERNAL_SERVICE")
                .claim("service", serviceName)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accessTokenExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ TOKEN VALIDATION
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token);
            return true;
        } catch (JwtException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    // ✅ REFRESH TOKEN VERIFICATION
    public Claims verifyRefreshToken(String refreshToken) {
        try {
            return getClaims(refreshToken);
        } catch (ExpiredJwtException e) {
            log.warn("Refresh token expired");
            throw e;
        } catch (JwtException e) {
            log.warn("Invalid refresh token");
            throw e;
        }
    }

    // ✅ GET CLAIMS
    public Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    // ✅ OTP TOKEN
    public String generateOtpVerificationToken(String email) {
        return Jwts.builder()
                .setSubject(email)
                .claim("type", "otp")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + otpTokenExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    // ✅ ACCOUNT ACTIVATION TOKEN
    public String generateAccountVerificationToken(String email){
        return Jwts.builder()
                .setSubject(email)
                .claim("type", "account-activation")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + accountTokenExpiration))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }
}
