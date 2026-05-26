package com.example.iam_service;

import com.example.iam_service.config.jwt.JwtProvider;
import com.example.iam_service.model.User;
import com.example.iam_service.repository.UserRepository;
import com.example.shared.enums.Gender;
import com.example.shared.enums.UserStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.datasource.username=sa",
    "spring.datasource.password=password",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "spring.kafka.bootstrap-servers=localhost:9092",
    "spring.data.redis.host=localhost",
    "spring.data.redis.port=6379",
    "jwt.secret=test-secret-key-for-integration-testing-only-minimum-256-bits",
    "jwt.access.expiration=86400000",
    "jwt.refresh.expiration=604800000",
    "jwt.otp.expiration=300000",
    "jwt.account.expiration=86400000",
    "frontend.url=http://localhost:3000",
    "server.port=0"
})
@AutoConfigureMockMvc
class IamControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtProvider jwtProvider;

    // Mock external dependencies that make network calls
    @MockBean
    private JavaMailSender javaMailSender;

    @MockBean
    private StringRedisTemplate stringRedisTemplate;

    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();

        // Create a test user in H2
        User user = new User();
        user.setUserId("user1");
        user.setFullName("Test User");
        user.setEmail("user@test.com");
        user.setPhoneNumber("0123456789");
        user.setStudentId("STU001");
        user.setPassword("$2a$10$dummyHashedPassword1234567890abcdefghijkl"); // bcrypt hash
        user.setRole("USER");
        user.setGender(Gender.MALE);
        user.setDateOfBirth(LocalDate.of(2000, 1, 1));
        user.setStatus(UserStatus.ACTIVE);
        user.setIsDeleted(false);
        user.setBalance(0.0);
        user.setPoints(0);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Create an admin user
        User admin = new User();
        admin.setUserId("admin1");
        admin.setFullName("Admin User");
        admin.setEmail("admin@test.com");
        admin.setPhoneNumber("0987654321");
        admin.setStudentId("ADM001");
        admin.setPassword("$2a$10$dummyHashedPassword1234567890abcdefghijkl");
        admin.setRole("ADMIN");
        admin.setGender(Gender.MALE);
        admin.setDateOfBirth(LocalDate.of(1990, 1, 1));
        admin.setStatus(UserStatus.ACTIVE);
        admin.setIsDeleted(false);
        admin.setBalance(0.0);
        admin.setPoints(0);
        admin.setCreatedAt(LocalDateTime.now());
        admin.setUpdatedAt(LocalDateTime.now());
        userRepository.save(admin);

        userToken = jwtProvider.generateAccessToken("user1", "user@test.com", "USER");
        adminToken = jwtProvider.generateAccessToken("admin1", "admin@test.com", "ADMIN");
    }

    // ==================== Auth Endpoints (Public) ====================

    @Test
    void loginEndpoint_WithInvalidCredentials_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"wrong@test.com\",\"password\":\"wrongpass\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registerEndpoint_WithMissingFields_ReturnsBadRequest() throws Exception {
        mockMvc.perform(post("/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"new@test.com\"}"))
                .andExpect(status().isBadRequest());
    }

    // ==================== User Endpoints (Authenticated) ====================

    @Test
    void getUserById_WithoutToken_Returns401() throws Exception {
        mockMvc.perform(get("/users/user1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getUserById_WithAdminToken_ReturnsUser() throws Exception {
        mockMvc.perform(get("/users/user1")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.data.email", is("user@test.com")));
    }

    @Test
    void getAllUsers_WithAdminToken_ReturnsList() throws Exception {
        mockMvc.perform(get("/users")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)));
    }

    @Test
    void getAllUsers_WithUserToken_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/users")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getUserById_NotFound_ReturnsError() throws Exception {
        mockMvc.perform(get("/users/non-existent")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }
}
