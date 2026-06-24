package com.example.vendor_service;

import com.example.vendor_service.config.jwt.JwtProvider;
import com.example.vendor_service.dtos.UserInfoDto;
import static org.mockito.Mockito.when;
import com.example.vendor_service.helper.IamClient;
import com.example.vendor_service.helper.producer.KafkaProducerService;
import com.example.vendor_service.model.Vendor;
import com.example.vendor_service.model.VendorOrderNotification;
import com.example.vendor_service.repository.VendorOrderNotificationRepository;
import com.example.vendor_service.repository.VendorRepository;
import com.example.shared.enums.OrderStatus;
import com.example.shared.enums.VendorStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Collections;

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
        "server.port=0",
        "jwt.secret=test-secret-key-for-integration-testing-only-minimum-256-bits",
        "jwt.access.expiration=86400000",
        "jwt.refresh.expiration=604800000",
        "jwt.otp.expiration=300000",
        "jwt.account.expiration=86400000",
        "internal-token.service-name=vendor-service",
        "internal-token.api-key=test-secret-key-for-integration-testing-only-minimum-256-bits",
        "internal-token.auth-url=http://localhost:0/iam/internal/auth/token"
})
@AutoConfigureMockMvc
class VendorControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private VendorOrderNotificationRepository notificationRepository;

    @Autowired
    private JwtProvider jwtProvider;

    // Mock external clients
    @MockBean
    private IamClient iamClient;

    @MockBean
    private KafkaProducerService kafkaProducerService;

    private String managerToken;
    private String adminToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        notificationRepository.deleteAll();
        vendorRepository.deleteAll();

        // Seed a test vendor
        Vendor vendor = new Vendor();
        vendor.setVendorId("vendor1");
        vendor.setName("Test Vendor");
        vendor.setDescription("A test vendor");
        vendor.setStatus(VendorStatus.ACCEPTED);
        vendor.setManagerId("manager1");
        vendor.setWorkingHourFrom(LocalTime.of(8, 0));
        vendor.setWorkingHourTo(LocalTime.of(22, 0));
        vendor.setCreatedAt(LocalDateTime.now());
        vendor.setUpdatedAt(LocalDateTime.now());
        vendorRepository.save(vendor);

        // Seed a vendor order notification
        VendorOrderNotification notification = new VendorOrderNotification();
        notification.setVendorOrderId("vo1");
        notification.setOrderId("order1");
        notification.setVendorId("vendor1");
        notification.setCustomerId("customer1");
        notification.setStatus(OrderStatus.PENDING);
        notification.setMenuItems(Collections.emptyList());
        notification.setCreatedAt(LocalDateTime.now());
        notificationRepository.save(notification);

        managerToken = jwtProvider.generateAccessToken("manager1", "manager@test.com", "MANAGER");
        adminToken = jwtProvider.generateAccessToken("admin1", "admin@test.com", "ADMIN");
        userToken = jwtProvider.generateAccessToken("user1", "user@test.com", "USER");

        // Stub IamClient so VendorOrderController can resolve vendorId for manager1
        UserInfoDto managerInfo = new UserInfoDto("manager1", "Manager", null, "manager@test.com", "MANAGER", "vendor1");
        when(iamClient.getUserInfo("manager1")).thenReturn(managerInfo);
    }

    // ==================== Authentication Tests ====================

    @Test
    void getVendors_WithoutToken_Returns401() throws Exception {
        mockMvc.perform(get("/vendors")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    // ==================== VendorController Tests ====================

    @Test
    void getAllVendors_WithAdminToken_ReturnsVendors() throws Exception {
        mockMvc.perform(get("/vendors")
                .header("Authorization", "Bearer " + adminToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    void getAllVendors_WithUserToken_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/vendors")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getActiveVendors_WithUserToken_ReturnsVendors() throws Exception {
        mockMvc.perform(get("/vendors/active")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)));
    }

    @Test
    void getVendorById_WithValidToken_ReturnsVendor() throws Exception {
        mockMvc.perform(get("/vendors/vendor1")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.data.name", is("Test Vendor")));
    }

    @Test
    void getMyVendor_WithManagerToken_ReturnsVendor() throws Exception {
        mockMvc.perform(get("/vendors/get-my-vendor")
                .header("Authorization", "Bearer " + managerToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.data.name", is("Test Vendor")));
    }

    @Test
    void getMyVendor_WithUserToken_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/vendors/get-my-vendor")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    // ==================== VendorOrderController Tests ====================

    @Test
    void getOrderNotifications_WithManagerToken_ReturnsNotifications() throws Exception {
        mockMvc.perform(get("/vendor-orders/notifications")
                .header("Authorization", "Bearer " + managerToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)));
    }

    @Test
    void getOrderNotifications_WithUserToken_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/vendor-orders/notifications")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getVendorOrders_WithManagerToken_ReturnsOrders() throws Exception {
        mockMvc.perform(get("/vendor-orders/get-vendor-order")
                .header("Authorization", "Bearer " + managerToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)));
    }

    @Test
    void healthCheck_WithValidToken_ReturnsOk() throws Exception {
        mockMvc.perform(get("/vendor-orders/health")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)));
    }
}
