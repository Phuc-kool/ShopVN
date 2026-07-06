package com.ecommerce.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OrderRequest {

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    @Size(max = 500, message = "Địa chỉ tối đa 500 ký tự")
    private String shippingAddress;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String note;

}
