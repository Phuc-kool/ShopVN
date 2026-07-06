package com.ecommerce.event;

import java.math.BigDecimal;

public record OrderPaidEvent(
        Long orderId,
        String userEmail,
        BigDecimal totalAmount,
        String transactionId
) {}
