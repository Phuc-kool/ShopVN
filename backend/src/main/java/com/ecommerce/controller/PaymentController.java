package com.ecommerce.controller;

import com.ecommerce.exception.BadRequestException;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.service.OrderService;
import com.ecommerce.service.VNPayService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/payment/vnpay")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final VNPayService vnPayService;
    private final OrderService orderService;

    @GetMapping("/ipn")
    public ResponseEntity<Map<String, String>> handleIpn(@RequestParam Map<String, String> params) {

        if (!vnPayService.verifySignature(params)) {
            log.warn("VNPay IPN: chữ ký không hợp lệ. params={}", params);
            return ResponseEntity.ok(Map.of("RspCode", "97", "Message", "Invalid signature"));
        }

        Long orderId;
        try {
            orderId = Long.valueOf(params.get("vnp_TxnRef"));
        } catch (NumberFormatException e) {
            return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));
        }

        String responseCode = params.get("vnp_ResponseCode");
        String transactionNo = params.get("vnp_TransactionNo");
        String amountStr = params.get("vnp_Amount");

        try {
            if ("00".equals(responseCode)) {
                orderService.confirmPayment(orderId, transactionNo, amountStr);
            } else {
                orderService.markPaymentFailed(orderId);
            }
            return ResponseEntity.ok(Map.of("RspCode", "00", "Message", "Confirm Success"));

        } catch (ResourceNotFoundException e) {
            return ResponseEntity.ok(Map.of("RspCode", "01", "Message", "Order not found"));

        } catch (IllegalStateException e) {

            log.info("VNPay IPN: đơn hàng {} đã được xử lý trước đó, bỏ qua duplicate.", orderId);
            return ResponseEntity.ok(Map.of("RspCode", "02", "Message", "Order already confirmed"));

        } catch (BadRequestException e) {

            log.warn("VNPay IPN: amount không khớp cho order {}: {}", orderId, e.getMessage());
            return ResponseEntity.ok(Map.of("RspCode", "04", "Message", "Invalid amount"));
        }
    }
}
