package com.ecommerce.service;

import com.ecommerce.dto.request.CartItemRequest;
import com.ecommerce.dto.response.CartResponse;
import com.ecommerce.entity.CartItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.User;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    public CartResponse getCart(User user) {
        List<CartItem> items = cartItemRepository.findByUserIdWithProduct(user.getId());
        return CartResponse.fromEntities(items);
    }

    @Transactional
    public CartResponse addItem(User user, CartItemRequest request) {

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", request.getProductId()));

        if (!product.getEnabled()) {
            throw new BadRequestException("Sản phẩm không còn được bán");
        }

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Sản phẩm chỉ còn " + product.getStock() + " trong kho");
        }

        Optional<CartItem> existing = cartItemRepository
                .findByUserIdAndProductId(user.getId(), request.getProductId());

        if (existing.isPresent()) {
            CartItem item = existing.get();
            int newQty = item.getQuantity() + request.getQuantity();

            if (product.getStock() < newQty) {
                throw new BadRequestException("Sản phẩm chỉ còn " + product.getStock() + " trong kho");
            }

            item.setQuantity(newQty);
            cartItemRepository.save(item);
        } else {
            CartItem newItem = CartItem.builder()
                    .user(user)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cartItemRepository.save(newItem);
        }

        return getCart(user);
    }

    @Transactional
    public CartResponse updateItem(User user, Long itemId, CartItemRequest request) {

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item", itemId));

        if (!item.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Không thể sửa item của người khác");
        }

        if (item.getProduct().getStock() < request.getQuantity()) {
            throw new BadRequestException("Sản phẩm chỉ còn " + item.getProduct().getStock() + " trong kho");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return getCart(user);
    }

    @Transactional
    public CartResponse removeItem(User user, Long itemId) {

        int deleted = cartItemRepository.deleteByIdAndUserId(itemId, user.getId());
        if (deleted == 0) {
            throw new ResourceNotFoundException("Cart item", itemId);
        }

        return getCart(user);
    }

    public int countItems(User user) {
        return cartItemRepository.countByUserId(user.getId());
    }
}
