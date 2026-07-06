package com.ecommerce.service;

import com.ecommerce.dto.request.OrderRequest;
import com.ecommerce.dto.request.UpdateOrderStatusRequest;
import com.ecommerce.dto.response.OrderResponse;
import com.ecommerce.dto.response.PageResponse;
import com.ecommerce.entity.*;
import com.ecommerce.entity.Order.OrderStatus;
import com.ecommerce.event.OrderPaidEvent;
import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.CartItemRepository;
import com.ecommerce.repository.OrderRepository;
import com.ecommerce.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final VNPayService vnPayService;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public OrderResponse placeOrder(User user, OrderRequest request) {

        List<CartItem> cartItems = cartItemRepository.findByUserIdWithProduct(user.getId());

        if (cartItems.isEmpty()) {
            throw new BadRequestException("Giỏ hàng trống, không thể đặt hàng");
        }

        Order order = Order.builder()
                .user(user)
                .status(OrderStatus.PENDING_PAYMENT)
                .shippingAddress(request.getShippingAddress())
                .note(request.getNote())
                .totalAmount(BigDecimal.ZERO)
                .build();

        BigDecimal totalAmount = BigDecimal.ZERO;

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            if (product.getStock() < cartItem.getQuantity()) {
                throw new BadRequestException(
                    "Sản phẩm '" + product.getName() + "' chỉ còn " + product.getStock() + " trong kho"
                );
            }

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(product)
                    .quantity(cartItem.getQuantity())
                    .unitPrice(product.getPrice())
                    .build();

            order.getItems().add(orderItem);

            totalAmount = totalAmount.add(
                product.getPrice().multiply(BigDecimal.valueOf(cartItem.getQuantity()))
            );

            product.setStock(product.getStock() - cartItem.getQuantity());
            productRepository.save(product);
        }

        order.setTotalAmount(totalAmount);
        orderRepository.save(order);

        cartItemRepository.deleteAllByUserId(user.getId());

        String paymentUrl = vnPayService.createPaymentUrl(order);

        return OrderResponse.fromEntity(order).toBuilder()
                .paymentUrl(paymentUrl)
                .build();
    }

    @Transactional
    public void confirmPayment(Long orderId, String transactionNo, String vnpAmountStr) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (order.getStatus() != OrderStatus.PENDING_PAYMENT) {
            throw new IllegalStateException(
                "Đơn hàng " + orderId + " đang ở trạng thái " + order.getStatus() + ", bỏ qua IPN trùng lặp"
            );
        }

        BigDecimal vnpAmount = new BigDecimal(vnpAmountStr).divide(BigDecimal.valueOf(100));
        if (vnpAmount.compareTo(order.getTotalAmount()) != 0) {
            throw new BadRequestException(
                "Số tiền IPN (" + vnpAmount + ") không khớp với đơn hàng (" + order.getTotalAmount() + ")"
            );
        }

        order.setStatus(OrderStatus.CONFIRMED);
        order.setTransactionId(transactionNo);
        orderRepository.save(order);

        eventPublisher.publishEvent(new OrderPaidEvent(
                order.getId(),
                order.getUser().getEmail(),
                order.getTotalAmount(),
                transactionNo
        ));
    }

    @Transactional
    public void markPaymentFailed(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        if (order.getStatus() == OrderStatus.PENDING_PAYMENT) {
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            orderRepository.save(order);

        }
    }

    public PageResponse<OrderResponse> getMyOrders(User user, Pageable pageable) {
        return new PageResponse<>(
                orderRepository.findByUserId(user.getId(), pageable)
                        .map(OrderResponse::fromEntitySummary)
        );
    }

    public OrderResponse getMyOrderDetail(User user, Long orderId) {

        if (!orderRepository.existsByIdAndUserId(orderId, user.getId())) {
            throw new ResourceNotFoundException("Order", orderId);
        }

        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        return OrderResponse.fromEntity(order);
    }

    public PageResponse<OrderResponse> getAllOrders(OrderStatus status, Pageable pageable) {
        return new PageResponse<>(
                orderRepository.findAdminWithFilters(status, pageable)
                        .map(OrderResponse::fromEntitySummary)
        );
    }

    public OrderResponse getOrderDetail(Long orderId) {
        Order order = orderRepository.findByIdWithItems(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        return OrderResponse.fromEntity(order);
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, UpdateOrderStatusRequest request) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        validateStatusTransition(order.getStatus(), request.getStatus());

        if (request.getStatus() == OrderStatus.CANCELLED) {
            restoreStock(order);
        }

        order.setStatus(request.getStatus());
        return OrderResponse.fromEntitySummary(orderRepository.save(order));
    }

    public BigDecimal getTotalRevenue() {
        return orderRepository.getTotalRevenue();
    }

    public long getTotalOrders() {
        return orderRepository.countAllOrders();
    }

    private void validateStatusTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING_PAYMENT -> next == OrderStatus.CONFIRMED
                                  || next == OrderStatus.PAYMENT_FAILED
                                  || next == OrderStatus.CANCELLED;
            case PENDING    -> next == OrderStatus.CONFIRMED || next == OrderStatus.CANCELLED;
            case CONFIRMED  -> next == OrderStatus.SHIPPED   || next == OrderStatus.CANCELLED;
            case SHIPPED    -> next == OrderStatus.DELIVERED;
            case DELIVERED  -> false;
            case CANCELLED  -> false;
            case PAYMENT_FAILED -> false;
        };

        if (!valid) {
            throw new BadRequestException(
                "Không thể chuyển trạng thái từ " + current + " sang " + next
            );
        }
    }

    private void restoreStock(Order order) {
        for (OrderItem item : order.getItems()) {
            Product product = item.getProduct();
            product.setStock(product.getStock() + item.getQuantity());
            productRepository.save(product);
        }
    }
}
