package com.example.shared.dtos.PageDtos;

import org.springframework.data.domain.Page;
import org.springframework.stereotype.Component;

@Component
public class PageDtoConverter {
    public <T, R> PageDto<R> convert(Page<T> from, java.util.function.Function<T, R> converter) {
        return new PageDto<>(
                from.getContent().stream().map(converter).toList(),
                from.getNumber(),
                from.getSize(),
                from.getTotalElements(),
                from.getTotalPages(),
                from.isLast(),
                from.hasNext(),
                from.hasPrevious());
    }

    public <T> PageDto<T> convert(Page<T> from) {
        return new PageDto<>(
                from.getContent(),
                from.getNumber(),
                from.getSize(),
                from.getTotalElements(),
                from.getTotalPages(),
                from.isLast(),
                from.hasNext(),
                from.hasPrevious());
    }
}
