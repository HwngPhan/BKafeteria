package com.example.menu_service.service;

import com.example.menu_service.dtos.Request.CreateFeedbackRequest;
import com.example.menu_service.dtos.Request.UpdateFeedbackRequest;
import com.example.menu_service.model.Feedback;
import com.example.menu_service.model.MenuItem;
import com.example.menu_service.repository.FeedbackRepository;
import com.example.menu_service.repository.MenuItemRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {
    private final FeedbackRepository feedbackRepository;
    private final MenuItemRepository menuItemRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, MenuItemRepository menuItemRepository) {
        this.feedbackRepository = feedbackRepository;
        this.menuItemRepository = menuItemRepository;
    }

    @Transactional
    public Feedback createFeedback(CreateFeedbackRequest request, String userId) {
        MenuItem menuItem = menuItemRepository.findById(request.getMenuItemId())
                .orElseThrow(() -> new RuntimeException("Menu item not found."));

        Feedback feedback = new Feedback();

        feedback.setMenuItemId(request.getMenuItemId());
        feedback.setUserId(userId);
        feedback.setComment(request.getComment());
        feedback.setRating(request.getRating());
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setUpdatedAt(LocalDateTime.now());
        feedback.setIsDeleted(false);

        Feedback savedFeedback = feedbackRepository.save(feedback);
        updateMenuItemRating(request.getMenuItemId());

        return savedFeedback;
    }

    @Transactional
    public Feedback updateFeedback(String feedbackId, UpdateFeedbackRequest request, String userId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found."));

        if (!feedback.getUserId().equals(userId)) {
            throw new RuntimeException("You do not have permission to update this feedback.");
        }

        feedback.setComment(request.getComment());
        feedback.setRating(request.getRating());
        feedback.setUpdatedAt(LocalDateTime.now());

        Feedback updatedFeedback = feedbackRepository.save(feedback);
        updateMenuItemRating(feedback.getMenuItemId());

        return updatedFeedback;
    }

    @Transactional
    public void deleteFeedback(String feedbackId, String userId) {
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found."));

        if (!feedback.getUserId().equals(userId)) {
            throw new RuntimeException("You do not have permission to delete this feedback.");
        }

        feedback.setIsDeleted(true);
        feedback.setUpdatedAt(LocalDateTime.now());
        feedbackRepository.save(feedback);

        updateMenuItemRating(feedback.getMenuItemId());
    }

    public List<Feedback> getFeedbacksByMenuItem(String menuItemId) {
        return feedbackRepository.findActiveByMenuItemId(menuItemId);
    }

    public List<Feedback> getFeedbacksByUser(String userId) {
        return feedbackRepository.findActiveByUserId(userId);
    }

    private void updateMenuItemRating(String menuItemId) {
        Double avgRating = feedbackRepository.getAverageRatingByMenuItemId(menuItemId);
        MenuItem menuItem = menuItemRepository.findById(menuItemId).orElse(null);
        if (menuItem != null) {
            double rating = avgRating != null ? avgRating : 0.0;
            rating = Math.round(rating * 100.0) / 100.0;
            menuItem.setRating(rating);
            menuItemRepository.save(menuItem);
        }
    }
}
