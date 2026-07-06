package com.ecommerce.dto.response;

import com.ecommerce.entity.Category;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryResponse {

    private Long id;
    private String name;
    private String slug;
    private Long productCount;

    public static CategoryResponse fromEntity(Category c) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .build();
    }

    public static CategoryResponse fromEntity(Category c, Long productCount) {
        return CategoryResponse.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .productCount(productCount)
                .build();
    }
}
