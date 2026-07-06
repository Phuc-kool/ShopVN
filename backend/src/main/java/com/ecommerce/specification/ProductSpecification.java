package com.ecommerce.specification;

import com.ecommerce.entity.Product;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class ProductSpecification {

    public static Specification<Product> publicFilter(
            Long categoryId,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice
    ) {
        return (root, query, cb) -> {

            if (Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("category", JoinType.LEFT);
                query.distinct(true);
            }

            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.isTrue(root.get("enabled")));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + search.toLowerCase() + "%"
                ));
            }

            if (minPrice != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<Product> adminFilter(
            Long categoryId,
            String search
    ) {
        return (root, query, cb) -> {

            if (Long.class != query.getResultType() && long.class != query.getResultType()) {
                root.fetch("category", JoinType.LEFT);
                query.distinct(true);
            }

            List<Predicate> predicates = new ArrayList<>();

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (search != null && !search.isBlank()) {
                predicates.add(cb.like(
                        cb.lower(root.get("name")),
                        "%" + search.toLowerCase() + "%"
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
