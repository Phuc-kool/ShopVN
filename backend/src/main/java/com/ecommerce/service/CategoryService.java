package com.ecommerce.service;

import com.ecommerce.dto.request.CategoryRequest;
import com.ecommerce.dto.response.CategoryResponse;
import com.ecommerce.entity.Category;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CategoryRepository;
import com.ecommerce.util.SlugUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    @Cacheable(value = "categories", key = "'all'")
    public List<CategoryResponse> getAllPublic() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryResponse::fromEntity)
                .toList();
    }

    public List<CategoryResponse> getAllAdmin() {
        return categoryRepository.findAllWithProductCount()
                .stream()
                .map(row -> CategoryResponse.fromEntity(
                        (Category) row[0],
                        (Long) row[1]
                ))
                .toList();
    }

    @CacheEvict(value = "categories", key = "'all'")
    public CategoryResponse create(CategoryRequest request) {

        if (categoryRepository.existsByName(request.getName())) {
            throw new BadRequestException("Tên danh mục đã tồn tại");
        }

        String slug = (request.getSlug() != null && !request.getSlug().isBlank())
                ? request.getSlug()
                : SlugUtils.toSlug(request.getName());

        Category category = Category.builder()
                .name(request.getName())
                .slug(slug)
                .build();

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @CacheEvict(value = "categories", key = "'all'")
    public CategoryResponse update(Long id, CategoryRequest request) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        if (categoryRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new BadRequestException("Tên danh mục đã tồn tại");
        }

        category.setName(request.getName());

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            category.setSlug(request.getSlug());
        }

        return CategoryResponse.fromEntity(categoryRepository.save(category));
    }

    @CacheEvict(value = "categories", key = "'all'")
    public void delete(Long id) {

        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category", id));

        if (!category.getProducts().isEmpty()) {
            throw new BadRequestException(
                "Không thể xoá danh mục còn chứa sản phẩm. Hãy chuyển sản phẩm sang danh mục khác trước."
            );
        }

        categoryRepository.delete(category);
    }
}
