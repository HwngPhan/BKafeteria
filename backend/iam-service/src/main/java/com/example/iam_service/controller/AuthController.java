package com.example.iam_service.controller;

import com.example.iam_service.config.jwt.JwtProvider;
import com.example.iam_service.dtos.AuthDtos.Request.LoginRequest;
import com.example.iam_service.dtos.AuthDtos.Response.TokenResponse;
import com.example.iam_service.dtos.UserDtos.CreateUserRequest;
import com.example.iam_service.dtos.UserDtos.UserDto;
import com.example.iam_service.dtos.UserDtos.UserDtoConverter;
import com.example.iam_service.model.User;
import com.example.iam_service.service.UserService;
import com.example.shared.dtos.ApiResponse;
import com.example.shared.config.CustomUserDetails;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Duration;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
@Slf4j
public class AuthController {
    private final UserService userService;
    private final UserDtoConverter userDtoConverter;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;

    public AuthController(UserService userService, UserDtoConverter userDtoConverter, AuthenticationManager authenticationManager,
    JwtProvider jwtProvider){
        this.userService=userService;
        this.userDtoConverter=userDtoConverter;
        this.authenticationManager= authenticationManager;
        this.jwtProvider=jwtProvider;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserDto>> register(@RequestBody @Valid CreateUserRequest createUserRequest) {
        try {
            UserDto userDto = userDtoConverter.convert(userService.createUser(createUserRequest));

            ApiResponse<UserDto> response = new ApiResponse<>(
                    HttpStatus.CREATED.value(),
                    "Account registered successfully",
                    userDto);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        }
        catch (IllegalArgumentException e) {
            ApiResponse<UserDto> response = new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
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
}
