package com.ecommerce.controller;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.User;
import com.ecommerce.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;

    @GetMapping
    public ResponseEntity<CartResponse> getCart(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.getCart(user));
    }

    @PostMapping("/items")
    public ResponseEntity<CartResponse> addItem(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid CartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.addItem(user, request));
    }

    @PutMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> updateItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId,
            @RequestBody @Valid CartItemRequest request
    ) {
        return ResponseEntity.ok(cartService.updateItem(user, itemId, request));
    }

    @DeleteMapping("/items/{itemId}")
    public ResponseEntity<CartResponse> removeItem(
            @AuthenticationPrincipal User user,
            @PathVariable Long itemId
    ) {
        return ResponseEntity.ok(cartService.removeItem(user, itemId));
    }

    @GetMapping("/count")
    public ResponseEntity<Integer> countItems(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(cartService.countItems(user));
    }
}
