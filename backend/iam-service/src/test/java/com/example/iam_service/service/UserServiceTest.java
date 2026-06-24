package com.example.iam_service.service;

import com.example.iam_service.dtos.UserDtos.AssignVendorRequest;
import com.example.iam_service.dtos.UserDtos.CreateUserRequest;
import com.example.iam_service.dtos.UserDtos.UpdateUserRequest;
import com.example.iam_service.dtos.UserDtos.UpdateUserRequestAdmin;
import com.example.iam_service.model.User;
import com.example.iam_service.repository.UserRepository;
import com.example.shared.enums.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private StringRedisTemplate stringRedisTemplate;
    @Mock private ActivationService activationService;
    @Mock private ValueOperations<String, String> valueOperations;

    @InjectMocks
    private UserService userService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "expirationTime", 3600000L);
    }

    // ─── createUser ─────────────────────────────────────────────────────────────

    @Test
    void createUser_success() {
        when(userRepository.existsByEmail("test@mail.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("0123456789")).thenReturn(false);
        when(userRepository.existsByStudentId("SV001")).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(stringRedisTemplate.opsForValue()).thenReturn(valueOperations);
        doNothing().when(valueOperations).set(anyString(), anyString(), any());

        User saved = new User();
        when(userRepository.save(any())).thenReturn(saved);

        CreateUserRequest req = buildCreateRequest("test@mail.com", "0123456789", "SV001");
        User result = userService.createUser(req, "token123");

        assertNotNull(result);
        verify(activationService).sendActivationEmail(any(), eq("token123"), any());
    }

    @Test
    void createUser_duplicateEmail_throws() {
        when(userRepository.existsByEmail("dup@mail.com")).thenReturn(true);
        CreateUserRequest req = buildCreateRequest("dup@mail.com", "0123456789", "SV001");
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(req, "token"));
    }

    @Test
    void createUser_duplicatePhone_throws() {
        when(userRepository.existsByEmail("test@mail.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("0123456789")).thenReturn(true);
        CreateUserRequest req = buildCreateRequest("test@mail.com", "0123456789", "SV001");
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(req, "token"));
    }

    @Test
    void createUser_duplicateStudentId_throws() {
        when(userRepository.existsByEmail("test@mail.com")).thenReturn(false);
        when(userRepository.existsByPhoneNumber("0123456789")).thenReturn(false);
        when(userRepository.existsByStudentId("SV001")).thenReturn(true);
        CreateUserRequest req = buildCreateRequest("test@mail.com", "0123456789", "SV001");
        assertThrows(IllegalArgumentException.class, () -> userService.createUser(req, "token"));
    }

    // ─── updateUser ─────────────────────────────────────────────────────────────

    @Test
    void updateUser_success() {
        User user = buildUser("u1", "old@mail.com");
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailAndUserIdNot("new@mail.com", "u1")).thenReturn(false);

        UpdateUserRequest req = new UpdateUserRequest();
        req.setEmail("new@mail.com");
        req.setFullName("New Name");

        User result = userService.updateUser("u1", req);
        assertEquals("New Name", result.getFullName());
        assertEquals("new@mail.com", result.getEmail());
    }

    @Test
    void updateUser_duplicateEmail_throws() {
        User user = buildUser("u1", "old@mail.com");
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.existsByEmailAndUserIdNot("taken@mail.com", "u1")).thenReturn(true);

        UpdateUserRequest req = new UpdateUserRequest();
        req.setEmail("taken@mail.com");

        assertThrows(IllegalArgumentException.class, () -> userService.updateUser("u1", req));
    }

    // ─── updateUserAdmin ────────────────────────────────────────────────────────

    @Test
    void updateUserAdmin_adminCanAssignAnyRole() {
        User user = buildUser("u1", "u@mail.com");
        user.setRole("CUSTOMER");
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        UpdateUserRequestAdmin req = new UpdateUserRequestAdmin();
        req.setRole("MANAGER");

        assertDoesNotThrow(() -> userService.updateUserAdmin("u1", req, "ADMIN"));
        verify(userRepository).save(argThat(u -> "MANAGER".equals(u.getRole())));
    }

    @Test
    void updateUserAdmin_managerPromotesCustomerToStaff() {
        User user = buildUser("u1", "u@mail.com");
        user.setRole("CUSTOMER");
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        UpdateUserRequestAdmin req = new UpdateUserRequestAdmin();
        req.setRole("STAFF");

        assertDoesNotThrow(() -> userService.updateUserAdmin("u1", req, "MANAGER"));
        verify(userRepository).save(argThat(u -> "STAFF".equals(u.getRole())));
    }

    @Test
    void updateUserAdmin_managerDemotesStaffToCustomer() {
        User user = buildUser("u1", "u@mail.com");
        user.setRole("STAFF");
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        UpdateUserRequestAdmin req = new UpdateUserRequestAdmin();
        req.setRole("CUSTOMER");

        assertDoesNotThrow(() -> userService.updateUserAdmin("u1", req, "MANAGER"));
    }

    @Test
    void updateUserAdmin_managerCannotAssignAdmin_throws() {
        User user = buildUser("u1", "u@mail.com");
        user.setRole("CUSTOMER");
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));

        UpdateUserRequestAdmin req = new UpdateUserRequestAdmin();
        req.setRole("ADMIN");

        assertThrows(IllegalArgumentException.class,
                () -> userService.updateUserAdmin("u1", req, "MANAGER"));
    }

    @Test
    void updateUserAdmin_managerCannotModifyAdmin_throws() {
        User user = buildUser("u1", "u@mail.com");
        user.setRole("ADMIN");
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));

        UpdateUserRequestAdmin req = new UpdateUserRequestAdmin();
        req.setRole("STAFF");

        assertThrows(IllegalArgumentException.class,
                () -> userService.updateUserAdmin("u1", req, "MANAGER"));
    }

    @Test
    void updateUserAdmin_unknownCallerRole_throws() {
        User user = buildUser("u1", "u@mail.com");
        user.setRole("CUSTOMER");
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));

        UpdateUserRequestAdmin req = new UpdateUserRequestAdmin();
        req.setRole("STAFF");

        assertThrows(IllegalArgumentException.class,
                () -> userService.updateUserAdmin("u1", req, "CUSTOMER"));
    }

    // ─── deleteUser ─────────────────────────────────────────────────────────────

    @Test
    void deleteUser_softDelete() {
        User user = buildUser("u1", "u@mail.com");
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));

        userService.deleteUser("u1", true);

        verify(userRepository).save(argThat(u -> Boolean.TRUE.equals(u.getIsDeleted())));
    }

    @Test
    void deleteUser_hardDelete() {
        User user = buildUser("u1", "u@mail.com");
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));

        userService.deleteUser("u1", false);

        verify(userRepository, never()).save(any());
    }

    // ─── resetPassword ──────────────────────────────────────────────────────────

    @Test
    void resetPassword_success() {
        User user = buildUser("u1", "u@mail.com");
        user.setPassword("oldHash");
        when(userRepository.findByEmail("u@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("newPass", "oldHash")).thenReturn(false);
        when(passwordEncoder.encode("newPass")).thenReturn("newHash");
        when(userRepository.save(any())).thenReturn(user);

        boolean result = userService.resetPassword("u@mail.com", "newPass");
        assertTrue(result);
    }

    @Test
    void resetPassword_samePassword_throws() {
        User user = buildUser("u1", "u@mail.com");
        user.setPassword("hash");
        when(userRepository.findByEmail("u@mail.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("samePass", "hash")).thenReturn(true);

        assertThrows(IllegalArgumentException.class,
                () -> userService.resetPassword("u@mail.com", "samePass"));
    }

    @Test
    void resetPassword_userNotFound_returnsFalse() {
        when(userRepository.findByEmail("notfound@mail.com")).thenReturn(Optional.empty());
        boolean result = userService.resetPassword("notfound@mail.com", "pass");
        assertFalse(result);
    }

    // ─── assignVendor ───────────────────────────────────────────────────────────

    @Test
    void assignVendor_success() {
        User user = buildUser("u1", "u@mail.com");
        when(userRepository.findByEmail("u@mail.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        AssignVendorRequest req = new AssignVendorRequest();
        req.setEmail("u@mail.com");
        req.setRole("MANAGER");

        User result = userService.assignVendor("vendor1", req);
        assertEquals("vendor1", result.getVendorId());
        assertEquals("MANAGER", result.getRole());
    }

    // ─── setBalance ─────────────────────────────────────────────────────────────

    @Test
    void setBalance_success() {
        User user = buildUser("u1", "u@mail.com");
        user.setBalance(0.0);
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        User result = userService.setBalance("u1", 5000.0);
        assertEquals(5000.0, result.getBalance());
    }

    // ─── addPoints ──────────────────────────────────────────────────────────────

    @Test
    void addPoints_success() {
        User user = buildUser("u1", "u@mail.com");
        user.setPoints(100);
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        User result = userService.addPoints("u1", 50);
        assertEquals(150, result.getPoints());
    }

    @Test
    void addPoints_nullExistingPoints_treatedAsZero() {
        User user = buildUser("u1", "u@mail.com");
        user.setPoints(null);
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenReturn(user);

        User result = userService.addPoints("u1", 30);
        assertEquals(30, result.getPoints());
    }

    // ─── helpers ────────────────────────────────────────────────────────────────

    private CreateUserRequest buildCreateRequest(String email, String phone, String studentId) {
        CreateUserRequest req = new CreateUserRequest();
        req.setEmail(email);
        req.setPhoneNumber(phone);
        req.setStudentId(studentId);
        req.setFullName("Test User");
        req.setPassword("password");
        return req;
    }

    private User buildUser(String id, String email) {
        User user = new User();
        user.setUserId(id);
        user.setEmail(email);
        user.setFullName("Test");
        user.setStatus(UserStatus.ACTIVE);
        user.setIsDeleted(false);
        return user;
    }
}
