package com.example.shared.dtos;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class DateRange {
    private LocalDate from;
    private LocalDate to;

    public DateRange(LocalDate from, LocalDate to) {
        this.from = from;
        this.to = to;
    }

    public LocalDateTime getFromDateTime() {
        return from.atStartOfDay();
    }

    public LocalDateTime getToDateTime() {
        return to.plusDays(1).atStartOfDay().minusNanos(1);
    }
}
