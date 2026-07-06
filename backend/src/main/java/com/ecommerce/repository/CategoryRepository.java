package com.ecommerce.repository;

import com.ecommerce.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    @Query("SELECT c, COUNT(p) FROM Category c " +
           "LEFT JOIN c.products p ON p.enabled = true " +
           "GROUP BY c")
    List<Object[]> findAllWithProductCount();
}
