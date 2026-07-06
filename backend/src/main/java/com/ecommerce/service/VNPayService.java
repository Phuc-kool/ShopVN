package com.ecommerce.service;

import com.ecommerce.config.VNPayConfig;
import com.ecommerce.entity.Order;
import com.ecommerce.util.VNPayUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;

@Service
@RequiredArgsConstructor
public class VNPayService {

    private final VNPayConfig vnPayConfig;

    public String createPaymentUrl(Order order) {
        HttpServletRequest request =
                ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();

        long amount = order.getTotalAmount()
                .multiply(BigDecimal.valueOf(100))
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        String txnRef = String.valueOf(order.getId());

        Map<String, String> params = new TreeMap<>();
        params.put("vnp_Version", "2.1.0");
        params.put("vnp_Command", "pay");
        params.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        params.put("vnp_Amount", String.valueOf(amount));
        params.put("vnp_CurrCode", "VND");
        params.put("vnp_TxnRef", txnRef);
        params.put("vnp_OrderInfo", "Thanh toan don hang " + txnRef);
        params.put("vnp_OrderType", "other");
        params.put("vnp_Locale", "vn");
        params.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        params.put("vnp_IpAddr", VNPayUtils.getClientIpAddress(request));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
        LocalDateTime now = LocalDateTime.now();
        params.put("vnp_CreateDate", now.format(formatter));
        params.put("vnp_ExpireDate", now.plusMinutes(15).format(formatter));

        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<Map.Entry<String, String>> itr = params.entrySet().iterator();
        while (itr.hasNext()) {
            Map.Entry<String, String> entry = itr.next();
            String fieldName = entry.getKey();
            String fieldValue = entry.getValue();
            if (fieldValue != null && !fieldValue.isEmpty()) {
                hashData.append(fieldName).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII)).append('=')
                        .append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    hashData.append('&');
                    query.append('&');
                }
            }
        }

        String secureHash = VNPayUtils.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());
        query.append("&vnp_SecureHash=").append(secureHash);

        return vnPayConfig.getPayUrl() + "?" + query;
    }

    public boolean verifySignature(Map<String, String> params) {
    String receivedHash = params.get("vnp_SecureHash");
    if (receivedHash == null || receivedHash.isBlank()) {
        return false;
    }

    Map<String, String> fields = new TreeMap<>(params);
    fields.remove("vnp_SecureHash");
    fields.remove("vnp_SecureHashType");

    StringBuilder hashData = new StringBuilder();
    Iterator<Map.Entry<String, String>> itr = fields.entrySet().iterator();
    while (itr.hasNext()) {
        Map.Entry<String, String> entry = itr.next();
        if (entry.getValue() != null && !entry.getValue().isEmpty()) {
            hashData.append(entry.getKey()).append('=')
                    .append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII));
            if (itr.hasNext()) {
                hashData.append('&');
            }
        }
    }

    String computedHash = VNPayUtils.hmacSHA512(vnPayConfig.getHashSecret(), hashData.toString());

    System.out.println(">>> [DEBUG] hashSecret length = " + vnPayConfig.getHashSecret().length());
    System.out.println(">>> [DEBUG] hashData = " + hashData);
    System.out.println(">>> [DEBUG] computedHash = " + computedHash);
    System.out.println(">>> [DEBUG] receivedHash = " + receivedHash);

    return computedHash.equalsIgnoreCase(receivedHash);
}
}
