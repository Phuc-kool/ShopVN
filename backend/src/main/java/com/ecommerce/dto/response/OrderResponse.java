package com.ecommerce.dto.response;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.Order.OrderStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder(toBuilder = true)
public class OrderResponse {

    private Long id;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;

    private String paymentUrl;

    public static OrderResponse fromEntity(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .shippingAddress(o.getShippingAddress())
                .note(o.getNote())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .items(o.getItems().stream()
                        .map(OrderItemResponse::fromEntity)
                        .toList())
                .build();
    }

    public static OrderResponse fromEntitySummary(Order o) {
        return OrderResponse.builder()
                .id(o.getId())
                .status(o.getStatus())
                .totalAmount(o.getTotalAmount())
                .shippingAddress(o.getShippingAddress())
                .createdAt(o.getCreatedAt())
                .updatedAt(o.getUpdatedAt())
                .build();
    }
}
