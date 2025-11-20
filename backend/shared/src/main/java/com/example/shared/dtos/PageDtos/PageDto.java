package com.example.shared.dtos.PageDtos;

import java.util.Collections;
import java.util.List;

public record PageDto<T>(
                List<T> content,
                int page,
                int pageSize,
                long totalElements,
                int totalPages,
                Boolean isLast,
                Boolean hasNextPage,
                Boolean hasPreviousPage) {

  public static <T> PageDto<T> empty() {
        return new PageDto<>(
                Collections.emptyList(),
                0,
                0,
                0,
                0,
                true,
                false,
                false
        );
    }
}
