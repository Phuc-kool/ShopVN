package com.ecommerce.repository;

import com.ecommerce.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>,
                                            JpaSpecificationExecutor<Product> {

    @Query("SELECT p FROM Product p WHERE p.stock <= :threshold AND p.enabled = true ORDER BY p.stock ASC")
    List<Product> findLowStockProducts(@Param("threshold") int threshold);

    boolean existsByNameAndIdNot(String name, Long id);
}
