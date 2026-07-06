package com.ecommerce.listener;

import com.ecommerce.event.OrderPaidEvent;
import com.ecommerce.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class OrderPaymentListener {

    private final NotificationService notificationService;

    @Async("notificationExecutor")
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void onOrderPaid(OrderPaidEvent event) {
        log.info(">>> [DEBUG] Listener triggered, orderId={}, email={}", event.orderId(), event.userEmail());
        try {
            notificationService.sendOrderConfirmationEmail(
                    event.userEmail(), event.orderId(), event.totalAmount(), event.transactionId()
            );
        } catch (Exception e) {

            log.error("Gửi email xác nhận thất bại cho order {}: {}", event.orderId(), e.getMessage(), e);
        }
    }
}
