package com.example.menu_service.model;

import com.example.shared.hepler.CustomIdGenerator;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@Table(name = "feedbacks")
public class Feedback {
    @Id
    String feedbackId;

    @PrePersist
    public void assignIdIfMissing() {
        if (feedbackId == null || feedbackId.isBlank()) {
            this.feedbackId = CustomIdGenerator.generateFeedbackId();
        }
    }

    String comment;
    @NotNull
    Double rating;
    String userId;
    String menuItemId;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    Boolean isDeleted;
}
