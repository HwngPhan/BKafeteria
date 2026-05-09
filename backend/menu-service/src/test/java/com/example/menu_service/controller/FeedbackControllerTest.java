package com.example.menu_service.controller;

import com.example.menu_service.dtos.FeedbackDto;
import com.example.menu_service.dtos.FeedbackDtoConverter;
import com.example.menu_service.dtos.Request.CreateFeedbackRequest;
import com.example.menu_service.dtos.Request.UpdateFeedbackRequest;
import com.example.menu_service.model.Feedback;
import com.example.menu_service.service.FeedbackService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class FeedbackControllerTest {

    @Mock
    private FeedbackService feedbackService;
    @Mock
    private FeedbackDtoConverter feedbackDtoConverter;

    @InjectMocks
    private FeedbackController feedbackController;

    @Test
    void createFeedback_Success() {
        CreateFeedbackRequest request = new CreateFeedbackRequest();
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("user1");

        Feedback feedback = new Feedback();

        when(feedbackService.createFeedback(any(CreateFeedbackRequest.class), eq("user1"))).thenReturn(feedback);
        when(feedbackDtoConverter.convert(feedback)).thenReturn(null);

        ResponseEntity<ApiResponse<FeedbackDto>> response = feedbackController.createFeedback(request, userDetails);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("Feedback created successfully", response.getBody().getMessage());
    }

    @Test
    void updateFeedback_Success() {
        UpdateFeedbackRequest request = new UpdateFeedbackRequest();
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("user1");

        Feedback feedback = new Feedback();

        when(feedbackService.updateFeedback(eq("fb1"), any(UpdateFeedbackRequest.class), eq("user1"))).thenReturn(feedback);
        when(feedbackDtoConverter.convert(feedback)).thenReturn(null);

        ResponseEntity<ApiResponse<FeedbackDto>> response = feedbackController.updateFeedback("fb1", request, userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Feedback updated successfully", response.getBody().getMessage());
    }

    @Test
    void deleteFeedback_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("user1");

        doNothing().when(feedbackService).deleteFeedback("fb1", "user1");

        ResponseEntity<ApiResponse<Void>> response = feedbackController.deleteFeedback("fb1", userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("Feedback deleted successfully", response.getBody().getMessage());
    }

    @Test
    void getFeedbacksByMenuItem_Success() {
        Feedback feedback = new Feedback();

        when(feedbackService.getFeedbacksByMenuItem("item1")).thenReturn(Collections.singletonList(feedback));
        when(feedbackDtoConverter.convertList(anyList())).thenReturn(Collections.singletonList(null));

        ResponseEntity<ApiResponse<List<FeedbackDto>>> response = feedbackController.getFeedbacksByMenuItem("item1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void getMyFeedbacks_Success() {
        CustomUserDetails userDetails = mock(CustomUserDetails.class);
        when(userDetails.getId()).thenReturn("user1");

        Feedback feedback = new Feedback();

        when(feedbackService.getFeedbacksByUser("user1")).thenReturn(Collections.singletonList(feedback));
        when(feedbackDtoConverter.convertList(anyList())).thenReturn(Collections.singletonList(null));

        ResponseEntity<ApiResponse<List<FeedbackDto>>> response = feedbackController.getMyFeedbacks(userDetails);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }
}
