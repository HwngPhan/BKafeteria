package com.example.iam_service.controller;

import com.example.iam_service.config.jwt.JwtProvider;
import com.example.iam_service.dtos.AuthDtos.Request.LoginRequest;
import com.example.iam_service.dtos.AuthDtos.Request.OtpVerificationRequest;
import com.example.iam_service.dtos.AuthDtos.Request.ResetPasswordRequest;
import com.example.iam_service.dtos.AuthDtos.Request.SendOtpRequest;
import com.example.iam_service.dtos.AuthDtos.Response.OtpVerificationResponse;
import com.example.iam_service.dtos.AuthDtos.Response.TokenResponse;
import com.example.iam_service.dtos.UserDtos.CreateUserRequest;
import com.example.iam_service.dtos.UserDtos.UserDto;
import com.example.iam_service.dtos.UserDtos.UserDtoConverter;
import com.example.iam_service.model.User;
import com.example.iam_service.service.*;
import com.example.shared.dtos.ApiResponse;
import com.example.shared.config.CustomUserDetails;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import com.example.iam_service.service.RedisTokenService;
import com.example.iam_service.service.CustomUserDetailsService;
import java.time.Duration;
import java.util.Arrays;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {
    private final UserService userService;
    private final UserDtoConverter userDtoConverter;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;
    private final RedisTokenService redisTokenService;
    private final CustomUserDetailsService customUserDetailsService;
    private final OtpService otpService;
    private final ActivationService activationService;

    public AuthController(UserService userService, UserDtoConverter userDtoConverter, AuthenticationManager authenticationManager,
    JwtProvider jwtProvider,RedisTokenService redisTokenService, CustomUserDetailsService customUserDetailsService,
    OtpService otpService, ActivationService activationService){
        this.userService=userService;
        this.userDtoConverter=userDtoConverter;
        this.authenticationManager= authenticationManager;
        this.jwtProvider=jwtProvider;
        this.redisTokenService=redisTokenService;
        this.customUserDetailsService=customUserDetailsService;
        this.otpService=otpService;
        this.activationService=activationService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@RequestBody @Valid CreateUserRequest createUserRequest) {
        try {
            String accountActivationToken = jwtProvider.generateAccountVerificationToken(createUserRequest.getEmail());
            UserDto userDto = userDtoConverter
                    .convert(userService.createUser(createUserRequest, accountActivationToken));

            ApiResponse<UserDto> response = new ApiResponse<>(
                    HttpStatus.CREATED.value(),
                    "Account registered successfully",
                    userDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
        catch (IllegalArgumentException e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (RuntimeException e){
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>(400, e.getMessage(), null));
        }
        catch (Exception e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                    "Failed to create user", null);
            return new ResponseEntity<>(response, HttpStatus.INTERNAL_SERVER_ERROR);
        }

    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<TokenResponse>> login(
            @RequestBody @Valid LoginRequest loginRequest,
            HttpServletResponse response) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(), loginRequest.getPassword()));
            CustomUserDetails user = (CustomUserDetails) auth.getPrincipal();
            String accessToken = jwtProvider.generateAccessToken(
                    user.getId(), user.getEmail(), user.getRole());

            userService.updateLastLogin(user.getEmail());
            String jti = UUID.randomUUID().toString();
            String refreshToken = jwtProvider.generateRefreshToken(user.getId(), user.getEmail(), jti);
            redisTokenService.storeRefreshToken(user.getEmail(), jti, refreshToken, Duration.ofDays(7));

            String cookieValue = "refresh_token=" + refreshToken
                    + "; HttpOnly; Secure; Path=/; Max-Age=" + Duration.ofDays(7).getSeconds()
                    + "; SameSite=Strict";
            response.setHeader("Set-Cookie", cookieValue);

            return ResponseEntity.ok(
                    new com.example.shared.dtos.ApiResponse<>(200, "Login success", new TokenResponse(accessToken)));
        }catch (BadCredentialsException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "Invalid email or password", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(),
                            e.getMessage(),
                            null));
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(
            HttpServletRequest request,
            HttpServletResponse response) {

        try {
            Cookie[] cookies = request.getCookies();
            if (cookies == null) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(401, "Missing refresh token", null));
            }

            String refreshToken = Arrays.stream(cookies)
                    .filter(c -> "refresh_token".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst()
                    .orElse(null);

            if (refreshToken == null || !jwtProvider.validateToken(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(401, "Invalid refresh token", null));
            }

            Claims claims = jwtProvider.getClaims(refreshToken);

            String email = claims.get("email", String.class);
            String jti = claims.getId();
            String userId = claims.getSubject();   // ✅ no need String.valueOf()

            // ✅ Check refresh token validity from Redis
            if (!redisTokenService.isValidRefreshToken(email, jti, refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(401, "Token reuse detected or revoked", null));
            }

            // ✅ Rotation: remove old token
            redisTokenService.deleteRefreshToken(email, jti);

            // ✅ Issue new refresh token
            String newJti = UUID.randomUUID().toString();
            String newRefreshToken = jwtProvider.generateRefreshToken(userId, email, newJti);

            redisTokenService.storeRefreshToken(email, newJti, newRefreshToken, Duration.ofDays(7));

            // ✅ Send refresh token via cookie
            Cookie cookie = new Cookie("refresh_token", newRefreshToken);
            cookie.setHttpOnly(true);
            cookie.setSecure(true);
            cookie.setPath("/");
            cookie.setMaxAge((int) Duration.ofDays(7).getSeconds());
            response.addCookie(cookie);

            // ✅ Load UserDetails to get role
//            UserDetails userDetails = customUserDetailsService.loadUserByUsername(email);

            // ✅ Extract ONE ROLE ONLY
//            String role = userDetails.getAuthorities().stream()
//                    .map(GrantedAuthority::getAuthority)     // e.g. "ROLE_ADMIN"
//                    .map(auth -> auth.substring(5))          // remove "ROLE_"
//                    .findFirst()
//                    .orElseThrow();

            CustomUserDetails userDetails =
                    (CustomUserDetails) customUserDetailsService.loadUserByUsername(email);

            String role = userDetails.getRole();   // ✅ extract role directly



            // ✅ Generate new access token (no roles list, no privileges)
            String accessToken = jwtProvider.generateAccessToken(
                    userId,
                    email,
                    role
            );

            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Refresh success", new TokenResponse(accessToken))
            );

        } catch (ExpiredJwtException | MalformedJwtException | io.jsonwebtoken.security.SignatureException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "Invalid or expired refresh token", null));
        } catch (UsernameNotFoundException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(401, "User not found", null));
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @RequestHeader(value = "Authorization", required = false) String header,
            HttpServletRequest request,
            HttpServletResponse response) {
        try {
            // Blacklist access token nếu có
            if (header != null && header.startsWith("Bearer ")) {
                String token = header.substring(7);
                if (jwtProvider.validateToken(token)) {
                    Claims claims = jwtProvider.getClaims(token);
                    long ttlSeconds = (claims.getExpiration().getTime()
                            - System.currentTimeMillis()) / 1000;
                    if (ttlSeconds > 0) {
                        redisTokenService.blacklistToken(token, Duration.ofSeconds(ttlSeconds));
                    }
                }
            }

            // Xóa refresh token trong Redis nếu có cookie
            String refreshToken = Arrays
                    .stream(Optional.ofNullable(request.getCookies()).orElse(new Cookie[0]))
                    .filter(c -> "refresh_token".equals(c.getName()))
                    .map(Cookie::getValue)
                    .findFirst().orElse(null);

            if (refreshToken != null && jwtProvider.validateToken(refreshToken)) {
                Claims claims = jwtProvider.getClaims(refreshToken);
                String email = claims.get("email", String.class);
                String jti = claims.getId();
                redisTokenService.deleteRefreshToken(email, jti);
            }

            // Xóa cookie khỏi client
            Cookie expiredCookie = new Cookie("refresh_token", null);
            expiredCookie.setHttpOnly(true);
            expiredCookie.setSecure(true);
            expiredCookie.setPath("/");
            expiredCookie.setMaxAge(0);
            response.addCookie(expiredCookie);

            return ResponseEntity.ok(
                    new ApiResponse<>(200, "Logout successfully", null));

        } catch (JwtException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(400, "Invalid token", null));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(500, "Logout failed", null));
        }
    }

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(@RequestBody @Valid SendOtpRequest request) {
        otpService.sendOtp(request.getEmail());

        ApiResponse<Void> response = new ApiResponse<>(
                HttpStatus.OK.value(),
                "OTP sent successfully",
                null);

        return new ResponseEntity<>(response, HttpStatus.OK);
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<OtpVerificationResponse>> verifyOtp(
            @RequestBody @Valid OtpVerificationRequest request) {
        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp());
        if (isValid) {
            String otpToken = jwtProvider.generateOtpVerificationToken(request.getEmail());

            OtpVerificationResponse otpVerificationResponse = new OtpVerificationResponse();
            otpVerificationResponse.setOtpToken(otpToken);

            ApiResponse<OtpVerificationResponse> response = new ApiResponse<>(
                    HttpStatus.OK.value(),
                    "OTP verified successfully",
                    otpVerificationResponse);
            return new ResponseEntity<>(response, HttpStatus.OK);
        } else {
            ApiResponse<OtpVerificationResponse> response = new ApiResponse<>(
                    HttpStatus.BAD_REQUEST.value(),
                    "Invalid OTP",
                    null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }
        @SecurityRequirement(name = "bearerAuth")
        @PostMapping("/reset-password")
        public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody @Valid ResetPasswordRequest request) {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null || !authentication.isAuthenticated()
                    || "anonymousUser".equals(authentication.getPrincipal())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(HttpStatus.UNAUTHORIZED.value(), "Unauthorized!", null));
            }

            String tokenEmail = authentication.getName();
            if (!tokenEmail.equals(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse<>(HttpStatus.UNAUTHORIZED.value(), "Invalid OTP token",
                                null));
            }

            boolean isReset = userService.resetPassword(request.getEmail(), request.getNewPassword());

            if (isReset) {
                ApiResponse<Void> response = new ApiResponse<>(
                        HttpStatus.OK.value(),
                        "Password reset successfully",
                        null);
                return new ResponseEntity<>(response, HttpStatus.OK);
            } else {
                ApiResponse<Void> response = new ApiResponse<>(
                        HttpStatus.BAD_REQUEST.value(),
                        "Failed to reset password",
                        null);
                return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
            }
    }

    @GetMapping("/account-activation")
    public ResponseEntity<ApiResponse<Void>> verifyActivationLink(@RequestParam String token) {
        if (!jwtProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse<>(HttpStatus.UNAUTHORIZED.value(),
                            "Expired or invalid user activation token", null));
        }
        try {
            activationService.activateUserValidate(token);
            return ResponseEntity.ok(new ApiResponse<>(200, "Account link verified successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null));
        }
    }
}
