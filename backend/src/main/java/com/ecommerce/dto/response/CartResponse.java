package com.ecommerce.dto.response;

import com.ecommerce.entity.CartItem;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
public class CartResponse {

    private List<CartItemResponse> items;
    private int totalItems;
    private BigDecimal totalAmount;

    public static CartResponse fromEntities(List<CartItem> cartItems) {
        List<CartItemResponse> itemResponses = cartItems.stream()
                .map(CartItemResponse::fromEntity)
                .toList();

        BigDecimal total = itemResponses.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .items(itemResponses)
                .totalItems(itemResponses.size())
                .totalAmount(total)
                .build();
    }
}
