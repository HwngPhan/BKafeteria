package com.example.menu_service.controller;

import com.example.menu_service.dtos.FeedbackDto;
import com.example.menu_service.dtos.FeedbackDtoConverter;
import com.example.menu_service.dtos.Request.CreateFeedbackRequest;
import com.example.menu_service.dtos.Request.UpdateFeedbackRequest;
import com.example.menu_service.service.FeedbackService;
import com.example.shared.config.CustomUserDetails;
import com.example.shared.dtos.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/feedbacks")
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class FeedbackController {
    private final FeedbackService feedbackService;
    private final FeedbackDtoConverter feedbackDtoConverter;

    @PostMapping("/create")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FeedbackDto>> createFeedback(
            @RequestBody @Valid CreateFeedbackRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            FeedbackDto feedbackDto = feedbackDtoConverter.convert(
                    feedbackService.createFeedback(request, userDetails.getId()));
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new ApiResponse<>(HttpStatus.CREATED.value(), "Feedback created successfully", feedbackDto));
        } catch (RuntimeException e) {
            log.error("Error creating feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null));
        } catch (Exception e) {
            log.error("Unexpected error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error occurred", null));
        }
    }

    @PutMapping("/update/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<FeedbackDto>> updateFeedback(
            @PathVariable String id,
            @RequestBody @Valid UpdateFeedbackRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            FeedbackDto feedbackDto = feedbackDtoConverter.convert(
                    feedbackService.updateFeedback(id, request, userDetails.getId()));
            return ResponseEntity.ok(
                    new ApiResponse<>(HttpStatus.OK.value(), "Feedback updated successfully", feedbackDto));
        } catch (RuntimeException e) {
            log.error("Error updating feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null));
        } catch (Exception e) {
            log.error("Unexpected error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error occurred", null));
        }
    }

    @DeleteMapping("/delete/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> deleteFeedback(
            @PathVariable String id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            feedbackService.deleteFeedback(id, userDetails.getId());
            return ResponseEntity.ok(
                    new ApiResponse<>(HttpStatus.OK.value(), "Feedback deleted successfully", null));
        } catch (RuntimeException e) {
            log.error("Error deleting feedback: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new ApiResponse<>(HttpStatus.BAD_REQUEST.value(), e.getMessage(), null));
        } catch (Exception e) {
            log.error("Unexpected error: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error occurred", null));
        }
    }

    @GetMapping("/item/{menuItemId}")
    public ResponseEntity<ApiResponse<List<FeedbackDto>>> getFeedbacksByMenuItem(@PathVariable String menuItemId) {
        try {
            List<FeedbackDto> feedbacks = feedbackDtoConverter.convertList(
                    feedbackService.getFeedbacksByMenuItem(menuItemId));
            return ResponseEntity.ok(
                    new ApiResponse<>(HttpStatus.OK.value(), "Feedbacks retrieved successfully", feedbacks));
        } catch (Exception e) {
            log.error("Error retrieving feedbacks: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error occurred", null));
        }
    }

    @GetMapping("/my-feedbacks")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<FeedbackDto>>> getMyFeedbacks(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            List<FeedbackDto> feedbacks = feedbackDtoConverter.convertList(
                    feedbackService.getFeedbacksByUser(userDetails.getId()));
            return ResponseEntity.ok(
                    new ApiResponse<>(HttpStatus.OK.value(), "Feedbacks retrieved successfully", feedbacks));
        } catch (Exception e) {
            log.error("Error retrieving feedbacks: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse<>(HttpStatus.INTERNAL_SERVER_ERROR.value(), "Unexpected error occurred", null));
        }
    }
}
