package com.ecommerce.dto.response;

import com.ecommerce.entity.Product;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class ProductResponse {

    private Long id;
    private String name;
    private String description;
    private BigDecimal price;
    private Integer stock;
    private String imageUrl;
    private Boolean enabled;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;

    public static ProductResponse fromEntity(Product p) {
        return ProductResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                .price(p.getPrice())
                .stock(p.getStock())
                .imageUrl(p.getImageUrl())
                .enabled(p.getEnabled())
                .categoryId(p.getCategory().getId())
                .categoryName(p.getCategory().getName())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
