package com.ecommerce.config;

import jakarta.annotation.PostConstruct;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "vnpay")
@Getter
@Setter
public class VNPayConfig {
    private String tmnCode;
    private String hashSecret;
    private String payUrl;
    private String returnUrl;

    @PostConstruct
    public void logConfig() {
        System.out.println("=== VNPay Config Loaded ===");
        System.out.println("tmnCode: " + tmnCode);
        System.out.println("hashSecret: " + (hashSecret != null
                ? hashSecret.substring(0, Math.min(4, hashSecret.length())) + "..." + hashSecret.substring(Math.max(0, hashSecret.length() - 4))
                : "NULL"));
        System.out.println("returnUrl: " + returnUrl);
    }
}
