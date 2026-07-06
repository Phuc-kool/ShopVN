package com.ecommerce.service;

import com.ecommerce.dto.request.ProductRequest;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.dto.response.ProductResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.entity.Product;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.repository.ProductRepository;
import com.ecommerce.specification.ProductSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final FileStorageService fileStorageService;

    public PageResponse<ProductResponse> getPublicProducts(
            Pageable pageable,
            Long categoryId,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        Specification<Product> spec = ProductSpecification.publicFilter(
                categoryId, search, minPrice, maxPrice
        );

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        return new PageResponse<>(productPage.map(ProductResponse::fromEntity));
    }

    public ProductResponse getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        if (!product.getEnabled()) {
            throw new ResourceNotFoundException("Product", id);
        }

        return ProductResponse.fromEntity(product);
    }

    public PageResponse<ProductResponse> getAdminProducts(
            Pageable pageable,
            Long categoryId,
            String search
    ) {
        Specification<Product> spec = ProductSpecification.adminFilter(categoryId, search);

        Page<Product> productPage = productRepository.findAll(spec, pageable);

        return new PageResponse<>(productPage.map(ProductResponse::fromEntity));
    }

    @Transactional
    public ProductResponse create(ProductRequest request, MultipartFile image) {

        if (productRepository.existsByNameAndIdNot(request.getName(), 0L)) {
            throw new BadRequestException("Tên sản phẩm đã tồn tại");
        }

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        String imageUrl = request.getImageUrl();
        if (image != null && !image.isEmpty()) {
            imageUrl = fileStorageService.storeImage(image);
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .imageUrl(imageUrl)
                .enabled(request.getEnabled() != null ? request.getEnabled() : true)
                .category(category)
                .build();

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(Long id, ProductRequest request, MultipartFile image) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        if (productRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BadRequestException("Tên sản phẩm đã tồn tại");
        }

        if (!product.getCategory().getId().equals(request.getCategoryId())) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));
            product.setCategory(category);
        }

        if (image != null && !image.isEmpty()) {
            fileStorageService.deleteImage(product.getImageUrl());
            product.setImageUrl(fileStorageService.storeImage(image));
        }

        product.setName(request.getName());
        product.setDescription(request.getDescription());
        product.setPrice(request.getPrice());
        product.setStock(request.getStock());
        if (request.getEnabled() != null) {
            product.setEnabled(request.getEnabled());
        }

        return ProductResponse.fromEntity(productRepository.save(product));
    }

    @Transactional
    public void delete(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        fileStorageService.deleteImage(product.getImageUrl());
        productRepository.delete(product);
    }

    @Transactional
    public ProductResponse toggleEnabled(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", id));

        product.setEnabled(!product.getEnabled());
        return ProductResponse.fromEntity(productRepository.save(product));
    }

    public List<ProductResponse> getLowStockProducts(int threshold) {
        return productRepository.findLowStockProducts(threshold)
                .stream()
                .map(ProductResponse::fromEntity)
                .toList();
    }
}
