package com.example.shared.hepler;

import java.time.DayOfWeek;
import java.time.LocalDate;

import com.example.shared.dtos.DateRange;

public class DateRangeResolver {

    public static DateRange resolve(LocalDate from, LocalDate to, String period) {
        LocalDate now = LocalDate.now();

        if (from != null && to != null) {
            return new DateRange(from, to);
        }

        switch (period.toLowerCase()) {
            case "day":
                return new DateRange(now, now);
            case "week":
                LocalDate startOfWeek = now.with(DayOfWeek.MONDAY);
                LocalDate endOfWeek = now.with(DayOfWeek.SUNDAY);
                return new DateRange(startOfWeek, endOfWeek);
            case "month":
                LocalDate startOfMonth = now.withDayOfMonth(1);
                LocalDate endOfMonth = now.withDayOfMonth(now.lengthOfMonth());
                return new DateRange(startOfMonth, endOfMonth);
            case "quarter":
                int currentQuarter = (now.getMonthValue() - 1) / 3 + 1;
                int startMonth = (currentQuarter - 1) * 3 + 1;
                LocalDate startOfQuarter = LocalDate.of(now.getYear(), startMonth, 1);
                LocalDate endOfQuarter = startOfQuarter.plusMonths(3).minusDays(1);
                return new DateRange(startOfQuarter, endOfQuarter);
            case "year":
                LocalDate startOfYear = now.withDayOfYear(1);
                LocalDate endOfYear = now.withDayOfYear(now.lengthOfYear());
                return new DateRange(startOfYear, endOfYear);
            case "all":
                return new DateRange(LocalDate.of(2000, 1, 1), LocalDate.now());
            default:
                return new DateRange(now.minusDays(30), now);
        }
    }
}
