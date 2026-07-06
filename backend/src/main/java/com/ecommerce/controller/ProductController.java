package com.ecommerce.controller;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.service.ProductService;
import com.ecommerce.util.PageableBuilder;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/api/products")
    public ResponseEntity<PageResponse<ProductResponse>> getProducts(
            @RequestParam(defaultValue = "0")             int page,
            @RequestParam(defaultValue = "12")            int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @RequestParam(required = false)               Long categoryId,
            @RequestParam(required = false)               String search,
            @RequestParam(required = false)               BigDecimal minPrice,
            @RequestParam(required = false)               BigDecimal maxPrice
    ) {
        Pageable pageable = PageableBuilder.build(page, size, sort);
        return ResponseEntity.ok(
                productService.getPublicProducts(pageable, categoryId, search, minPrice, maxPrice)
        );
    }

    @GetMapping("/api/products/{id}")
    public ResponseEntity<ProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/api/admin/products")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<ProductResponse>> getAdminProducts(
            @RequestParam(defaultValue = "0")              int page,
            @RequestParam(defaultValue = "20")             int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort,
            @RequestParam(required = false)                Long categoryId,
            @RequestParam(required = false)                String search
    ) {
        Pageable pageable = PageableBuilder.build(page, size, sort);
        return ResponseEntity.ok(
                productService.getAdminProducts(pageable, categoryId, search)
        );
    }

    @PostMapping(value = "/api/admin/products", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> create(
            @RequestPart("product") @Valid ProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productService.create(request, image));
    }

    @PutMapping(value = "/api/admin/products/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> update(
            @PathVariable Long id,
            @RequestPart("product") @Valid ProductRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        return ResponseEntity.ok(productService.update(id, request, image));
    }

    @DeleteMapping("/api/admin/products/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/api/admin/products/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductResponse> toggleEnabled(@PathVariable Long id) {
        return ResponseEntity.ok(productService.toggleEnabled(id));
    }

    @GetMapping("/api/admin/products/low-stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<ProductResponse>> getLowStock(
            @RequestParam(defaultValue = "5") int threshold
    ) {
        return ResponseEntity.ok(productService.getLowStockProducts(threshold));
    }
}
