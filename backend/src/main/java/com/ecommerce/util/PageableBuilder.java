package com.ecommerce.util;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

public class PageableBuilder {

    private PageableBuilder() {}

    public static Pageable build(int page, int size, String sort) {

        int safeSize = Math.min(size, 50);

        int safePage = Math.max(page, 0);

        if (sort == null || sort.isBlank()) {
            return PageRequest.of(safePage, safeSize, Sort.by("createdAt").descending());
        }

        String[] parts = sort.split(",");
        String field     = parts[0].trim();
        String direction = parts.length > 1 ? parts[1].trim() : "desc";

        Sort sortObj = direction.equalsIgnoreCase("asc")
                ? Sort.by(field).ascending()
                : Sort.by(field).descending();

        return PageRequest.of(safePage, safeSize, sortObj);
    }

    public static Pageable build(int page, int size) {
        return build(page, size, null);
    }
}
