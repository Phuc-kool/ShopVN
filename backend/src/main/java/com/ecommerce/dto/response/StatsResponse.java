package com.ecommerce.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
public class StatsResponse {

    private long totalProducts;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private int lowStockCount;
}
