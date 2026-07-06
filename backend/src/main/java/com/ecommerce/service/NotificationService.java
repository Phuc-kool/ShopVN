package com.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final JavaMailSender mailSender;

    public void sendOrderConfirmationEmail(String toEmail, Long orderId, BigDecimal totalAmount, String transactionId) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Xác nhận đơn hàng #" + orderId);
        message.setText(
                "Cảm ơn bạn đã đặt hàng!\n\n" +
                "Mã đơn hàng: " + orderId + "\n" +
                "Tổng tiền: " + totalAmount + " VND\n" +
                "Mã giao dịch VNPay: " + transactionId + "\n\n" +
                "Đơn hàng của bạn đã được xác nhận thanh toán và đang được xử lý."
        );
        mailSender.send(message);
    }
}
