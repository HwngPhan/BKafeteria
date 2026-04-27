package com.example.menu_service.dtos;

import com.example.menu_service.model.Feedback;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class FeedbackDtoConverter {
    public FeedbackDto convert(Feedback feedback) {
        if (feedback == null) return null;
        FeedbackDto dto = new FeedbackDto();
        dto.setFeedbackId(feedback.getFeedbackId());
        dto.setComment(feedback.getComment());
        dto.setRating(feedback.getRating());
        dto.setUserId(feedback.getUserId());
        dto.setMenuItemId(feedback.getMenuItemId());
        dto.setCreatedAt(feedback.getCreatedAt());
        dto.setUpdatedAt(feedback.getUpdatedAt());
        return dto;
    }

    public List<FeedbackDto> convertList(List<Feedback> feedbacks) {
        if (feedbacks == null) return null;
        return feedbacks.stream().map(this::convert).collect(Collectors.toList());
    }
}
