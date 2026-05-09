package com.example.menu_service;

import com.example.menu_service.config.jwt.JwtProvider;
import com.example.menu_service.helper.IamClient;
import com.example.menu_service.model.Feedback;
import com.example.menu_service.model.MenuItem;
import com.example.menu_service.repository.FeedbackRepository;
import com.example.menu_service.repository.MenuItemRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

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
    "spring.data.redis.port=6379"
})
@AutoConfigureMockMvc
class MenuControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private JwtProvider jwtProvider;

    // Mock external clients
    @MockBean
    private IamClient iamClient;

    private String managerToken;
    private String userToken;

    @BeforeEach
    void setUp() {
        feedbackRepository.deleteAll();
        menuItemRepository.deleteAll();

        // Seed a test menu item
        MenuItem item = new MenuItem();
        item.setMenuItemId("item1");
        item.setName("Pho Bo");
        item.setDescription("Vietnamese beef noodle soup");
        item.setPrice(35000);
        item.setVendorId("vendor1");
        item.setRemaining(50);
        item.setCategory("Food");
        item.setRating(4.5);
        item.setImageUrl("http://example.com/pho.jpg");
        item.setCreatedAt(LocalDateTime.now());
        item.setUpdatedAt(LocalDateTime.now());
        menuItemRepository.save(item);

        // Seed a feedback
        Feedback feedback = new Feedback();
        feedback.setFeedbackId("fb1");
        feedback.setComment("Delicious!");
        feedback.setRating(5.0);
        feedback.setUserId("user1");
        feedback.setMenuItemId("item1");
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setUpdatedAt(LocalDateTime.now());
        feedback.setIsDeleted(false);
        feedbackRepository.save(feedback);

        managerToken = jwtProvider.generateAccessToken("manager1", "manager@test.com", "MANAGER");
        userToken = jwtProvider.generateAccessToken("user1", "user@test.com", "USER");
    }

    // ==================== Authentication Tests ====================

    @Test
    void getMenuItems_WithoutToken_Returns401() throws Exception {
        mockMvc.perform(get("/items/get-all")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    // ==================== MenuItemController Tests ====================

    @Test
    void getMenuItemById_WithUserToken_ReturnsItem() throws Exception {
        mockMvc.perform(get("/items/item1")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.data.name", is("Pho Bo")));
    }

    @Test
    void getMenuItemById_NotFound_ReturnsError() throws Exception {
        mockMvc.perform(get("/items/non-existent")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void getAllMenuItems_WithUserToken_ReturnsPage() throws Exception {
        mockMvc.perform(get("/items/get-all")
                .header("Authorization", "Bearer " + userToken)
                .param("page", "0")
                .param("size", "10")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)));
    }


    @Test
    void getMyMenu_WithUserToken_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/items/get-my-menu")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    @Test
    void getMenuItemsByVendorId_WithUserToken_ReturnsItems() throws Exception {
        mockMvc.perform(get("/items/get-by-vendor/vendor1")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    // ==================== FeedbackController Tests ====================

    @Test
    void getFeedbacksByMenuItem_WithUserToken_ReturnsFeedbacks() throws Exception {
        mockMvc.perform(get("/feedbacks/item/item1")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    void getMyFeedbacks_WithUserToken_ReturnsFeedbacks() throws Exception {
        mockMvc.perform(get("/feedbacks/my-feedbacks")
                .header("Authorization", "Bearer " + userToken)
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status", is(200)))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    void getMyFeedbacks_WithoutToken_Returns401() throws Exception {
        mockMvc.perform(get("/feedbacks/my-feedbacks")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }
}
