package com.ecommerce.repository;

import com.ecommerce.entity.Order;
import com.ecommerce.entity.Order.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Page<Order> findByUserId(Long userId, Pageable pageable);

    @Query("SELECT o FROM Order o " +
           "JOIN o.items i " +
           "JOIN i.product " +
           "WHERE o.id = :orderId")
    Optional<Order> findByIdWithItems(@Param("orderId") Long orderId);

    boolean existsByIdAndUserId(Long orderId, Long userId);

    @Query("SELECT o FROM Order o " +
           "WHERE (:status IS NULL OR o.status = :status)")
    Page<Order> findAdminWithFilters(
            @Param("status") OrderStatus status,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.status = 'DELIVERED'")
    BigDecimal getTotalRevenue();

    @Query("SELECT COUNT(o) FROM Order o")
    long countAllOrders();
}
