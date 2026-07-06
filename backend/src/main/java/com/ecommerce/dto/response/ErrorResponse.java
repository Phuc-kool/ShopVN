package com.ecommerce.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ErrorResponse {

    private int status;
    private String message;
    private String path;
    private LocalDateTime timestamp;

    public static ErrorResponse of(int status, String message, String path) {
        return ErrorResponse.builder()
                .status(status)
                .message(message)
                .path(path)
                .timestamp(LocalDateTime.now())
                .build();
    }
}
