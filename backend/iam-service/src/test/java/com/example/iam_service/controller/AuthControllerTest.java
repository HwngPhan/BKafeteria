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
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.Duration;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthControllerTest {

    @Mock
    private UserService userService;
    @Mock
    private UserDtoConverter userDtoConverter;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtProvider jwtProvider;
    @Mock
    private RedisTokenService redisTokenService;
    @Mock
    private CustomUserDetailsService customUserDetailsService;
    @Mock
    private OtpService otpService;
    @Mock
    private ActivationService activationService;

    @InjectMocks
    private AuthController authController;

    @Test
    void register_Success() {
        CreateUserRequest request = new CreateUserRequest();
        request.setEmail("test@test.com");
        when(jwtProvider.generateAccountVerificationToken(anyString())).thenReturn("token");
        User user = new User();
        when(userService.createUser(any(CreateUserRequest.class), anyString())).thenReturn(user);
        UserDto userDto = new UserDto(null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        when(userDtoConverter.convert(user)).thenReturn(userDto);

        ResponseEntity<ApiResponse<UserDto>> response = authController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Account registered successfully", response.getBody().getMessage());
    }

    @Test
    void login_Success() {
        LoginRequest request = new LoginRequest("test@test.com", "password");
        HttpServletResponse response = mock(HttpServletResponse.class);

        Authentication auth = mock(Authentication.class);
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("1");
        when(userDetails.getEmail()).thenReturn("test@test.com");
        when(userDetails.getRole()).thenReturn("ROLE_USER");
        
        when(auth.getPrincipal()).thenReturn(userDetails);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);

        when(jwtProvider.generateAccessToken(anyString(), anyString(), anyString())).thenReturn("access_token");
        when(jwtProvider.generateRefreshToken(anyString(), anyString(), anyString())).thenReturn("refresh_token");

        ResponseEntity<ApiResponse<TokenResponse>> result = authController.login(request, response);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertNotNull(result.getBody());
        assertEquals("Login success", result.getBody().getMessage());
        assertEquals("access_token", result.getBody().getData().getAccessToken());
        verify(redisTokenService, times(1)).storeRefreshToken(anyString(), anyString(), anyString(), any(Duration.class));
    }

    @Test
    void login_InvalidCredentials() {
        LoginRequest request = new LoginRequest("test@test.com", "wrong");
        HttpServletResponse response = mock(HttpServletResponse.class);

        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenThrow(new BadCredentialsException("Bad credentials"));

        ResponseEntity<ApiResponse<TokenResponse>> result = authController.login(request, response);

        assertEquals(HttpStatus.UNAUTHORIZED, result.getStatusCode());
        assertNotNull(result.getBody());
        assertEquals("Invalid email or password", result.getBody().getMessage());
    }
    
    @Test
    void logout_Success() {
        HttpServletRequest request = mock(HttpServletRequest.class);
        HttpServletResponse response = mock(HttpServletResponse.class);
        String token = "valid_token";
        
        when(jwtProvider.validateToken(token)).thenReturn(true);
        Claims claims = mock(Claims.class);
        when(claims.getExpiration()).thenReturn(new Date(System.currentTimeMillis() + 10000));
        when(jwtProvider.getClaims(token)).thenReturn(claims);
        
        Cookie cookie = new Cookie("refresh_token", "refresh_val");
        when(request.getCookies()).thenReturn(new Cookie[]{cookie});
        
        when(jwtProvider.validateToken("refresh_val")).thenReturn(true);
        Claims refreshClaims = mock(Claims.class);
        when(refreshClaims.get("email", String.class)).thenReturn("test@test.com");
        when(refreshClaims.getId()).thenReturn("jti");
        when(jwtProvider.getClaims("refresh_val")).thenReturn(refreshClaims);
        
        ResponseEntity<ApiResponse<Void>> result = authController.logout("Bearer " + token, request, response);
        
        assertEquals(HttpStatus.OK, result.getStatusCode());
        verify(redisTokenService, times(1)).deleteRefreshToken("test@test.com", "jti");
    }

    @Test
    void sendOtp_Success() {
        SendOtpRequest request = new SendOtpRequest();
        request.setEmail("test@test.com");

        doNothing().when(otpService).sendOtp(anyString());

        ResponseEntity<ApiResponse<Void>> result = authController.sendOtp(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        verify(otpService, times(1)).sendOtp(request.getEmail());
    }

    @Test
    void verifyOtp_Success() {
        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setEmail("test@test.com");
        request.setOtp("123456");

        when(otpService.verifyOtp(anyString(), anyString())).thenReturn(true);
        when(jwtProvider.generateOtpVerificationToken(anyString())).thenReturn("otp_token");

        ResponseEntity<ApiResponse<OtpVerificationResponse>> result = authController.verifyOtp(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals("otp_token", result.getBody().getData().getOtpToken());
    }

    @Test
    void verifyOtp_Invalid() {
        OtpVerificationRequest request = new OtpVerificationRequest();
        request.setEmail("test@test.com");
        request.setOtp("wrong");

        when(otpService.verifyOtp(anyString(), anyString())).thenReturn(false);

        ResponseEntity<ApiResponse<OtpVerificationResponse>> result = authController.verifyOtp(request);

        assertEquals(HttpStatus.BAD_REQUEST, result.getStatusCode());
    }

    @Test
    void resetPassword_Success() {
        ResetPasswordRequest request = new ResetPasswordRequest();
        request.setEmail("test@test.com");
        request.setNewPassword("newPass");

        SecurityContext securityContext = mock(SecurityContext.class);
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn("test@test.com");
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(userService.resetPassword(anyString(), anyString())).thenReturn(true);

        ResponseEntity<ApiResponse<Void>> result = authController.resetPassword(request);

        assertEquals(HttpStatus.OK, result.getStatusCode());
    }

    @Test
    void verifyActivationLink_Success() {
        String token = "valid_token";
        when(jwtProvider.validateToken(token)).thenReturn(true);
        doNothing().when(activationService).activateUserValidate(token);

        ResponseEntity<ApiResponse<Void>> result = authController.verifyActivationLink(token);

        assertEquals(HttpStatus.OK, result.getStatusCode());
    }
}
