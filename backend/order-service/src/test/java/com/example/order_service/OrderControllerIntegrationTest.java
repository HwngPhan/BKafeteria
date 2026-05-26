package com.example.order_service;

import com.example.order_service.config.jwt.JwtProvider;
import com.example.order_service.helper.IamClient;
import com.example.order_service.helper.MenuClient;
import com.example.order_service.helper.VendorClient;
import com.example.order_service.helper.producer.KafkaProducerService;
import com.example.order_service.model.Order;
import com.example.order_service.repository.OrderRepository;
import com.example.order_service.repository.VendorOrderRepository;
import com.example.shared.enums.OrderStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
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
    "internal-token.service-name=order-service",
    "internal-token.api-key=test-secret-key-for-integration-testing-only-minimum-256-bits",
    "internal-token.auth-url=http://localhost:0/iam/internal/auth/token"
})
@AutoConfigureMockMvc
class OrderControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private VendorOrderRepository vendorOrderRepository;

    @Autowired
    private JwtProvider jwtProvider;

    // Mock external service clients so no real HTTP calls are made
    @MockBean
    private IamClient iamClient;
    @MockBean
    private MenuClient menuClient;
    @MockBean
    private VendorClient vendorClient;
    @MockBean
    private KafkaProducerService kafkaProducerService;

    private String userToken;

    @BeforeEach
    void setUp() {
        vendorOrderRepository.deleteAll();
        orderRepository.deleteAll();
        // Generate a valid JWT token for a test user with role USER
        userToken = jwtProvider.generateAccessToken("user123", "user@test.com", "USER");
    }

    // ==================== Authentication Tests ====================

    @Test
    void getOrderById_WithoutToken_Returns401() throws Exception {
        mockMvc.perform(get("/orders/any-id")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void getOrders_WithoutToken_Returns401() throws Exception {
        mockMvc.perform(get("/orders/get-my-order")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void createOrder_WithoutToken_Returns401() throws Exception {
        mockMvc.perform(post("/orders")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    // ==================== GET /orders/{id} Tests ====================

    @Test
    void getOrderById_WithValidToken_ReturnsOrder() throws Exception {
        // Insert a test order directly into H2
        Order order = new Order();
        order.setOrderId("test-order-1");
        order.setCustomerId("user123");
        order.setStatus(OrderStatus.PENDING);
        order.setTotalPrice(100.0);
        order.setCreatedAt(LocalDateTime.now());
        order.setUpdatedAt(LocalDateTime.now());
        order.setIsDeleted(false);
        order.setOrderItems(Collections.emptyList());
        orderRepository.save(order);

        mockMvc.perform(get("/orders/test-order-1")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.message", is("Order retrieved successfully")));
    }

    @Test
    void getOrderById_NotFound_ReturnsError() throws Exception {
        mockMvc.perform(get("/orders/non-existent-id")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status", is(404)));
    }

    // ==================== GET /orders/get-my-order Tests ====================

    @Test
    void getMyOrders_WithValidToken_ReturnsOrderList() throws Exception {
        // Insert orders for this user
        Order order1 = new Order();
        order1.setOrderId("my-order-1");
        order1.setCustomerId("user123");
        order1.setStatus(OrderStatus.PENDING);
        order1.setTotalPrice(50.0);
        order1.setCreatedAt(LocalDateTime.now());
        order1.setUpdatedAt(LocalDateTime.now());
        order1.setIsDeleted(false);
        order1.setOrderItems(Collections.emptyList());
        orderRepository.save(order1);

        Order order2 = new Order();
        order2.setOrderId("my-order-2");
        order2.setCustomerId("user123");
        order2.setStatus(OrderStatus.PURCHASED);
        order2.setTotalPrice(75.0);
        order2.setCreatedAt(LocalDateTime.now());
        order2.setUpdatedAt(LocalDateTime.now());
        order2.setIsDeleted(false);
        order2.setOrderItems(Collections.emptyList());
        orderRepository.save(order2);

        mockMvc.perform(get("/orders/get-my-order")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.message", is("Orders retrieved successfully")))
                .andExpect(jsonPath("$.data.content", hasSize(2)));
    }

    @Test
    void getMyOrders_NoOrders_ReturnsEmptyList() throws Exception {
        mockMvc.perform(get("/orders/get-my-order")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));
    }
}
