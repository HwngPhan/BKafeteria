package com.example.shared.dtos;

import org.springframework.data.jpa.domain.Specification;

public interface Filterable<T> {
    public Specification<T> toSpecification();
}
