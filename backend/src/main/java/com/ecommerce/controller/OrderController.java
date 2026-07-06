package com.ecommerce.controller;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.dto.response.StatsResponse;
import com.ecommerce.entity.Order.OrderStatus;
import com.ecommerce.entity.User;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.ProductService;
import com.ecommerce.util.PageableBuilder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final ProductService productService;

    @PostMapping("/api/orders")
    public ResponseEntity<OrderResponse> placeOrder(
            @AuthenticationPrincipal User user,
            @RequestBody @Valid OrderRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.placeOrder(user, request));
    }

    @GetMapping("/api/orders/me")
    public ResponseEntity<PageResponse<OrderResponse>> getMyOrders(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "0")             int page,
            @RequestParam(defaultValue = "10")            int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Pageable pageable = PageableBuilder.build(page, size, sort);
        return ResponseEntity.ok(orderService.getMyOrders(user, pageable));
    }

    @GetMapping("/api/orders/me/{orderId}")
    public ResponseEntity<OrderResponse> getMyOrderDetail(
            @AuthenticationPrincipal User user,
            @PathVariable Long orderId
    ) {
        return ResponseEntity.ok(orderService.getMyOrderDetail(user, orderId));
    }

    @GetMapping("/api/admin/orders")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<OrderResponse>> getAllOrders(
            @RequestParam(required = false)                OrderStatus status,
            @RequestParam(defaultValue = "0")              int page,
            @RequestParam(defaultValue = "20")             int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort
    ) {
        Pageable pageable = PageableBuilder.build(page, size, sort);
        return ResponseEntity.ok(orderService.getAllOrders(status, pageable));
    }

    @GetMapping("/api/admin/orders/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> getOrderDetail(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderDetail(id));
    }

    @PatchMapping("/api/admin/orders/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<OrderResponse> updateStatus(
            @PathVariable Long id,
            @RequestBody @Valid UpdateOrderStatusRequest request
    ) {
        return ResponseEntity.ok(orderService.updateStatus(id, request));
    }

    @GetMapping("/api/admin/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StatsResponse> getStats() {
        StatsResponse stats = StatsResponse.builder()
                .totalProducts(productService.getLowStockProducts(Integer.MAX_VALUE).size())
                .totalOrders(orderService.getTotalOrders())
                .totalRevenue(orderService.getTotalRevenue())
                .lowStockCount(productService.getLowStockProducts(5).size())
                .build();
        return ResponseEntity.ok(stats);
    }
}
