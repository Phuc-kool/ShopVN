package com.ecommerce.service;

import com.ecommerce.exception.BadRequestException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    @Value("${app.upload.dir}")
    private String uploadDir;

    public String storeImage(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File ảnh không được rỗng");
        }

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("Chỉ chấp nhận file ảnh (jpg, png, gif...)");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File ảnh tối đa 5MB");
        }

        try {

            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String originalName = file.getOriginalFilename();
            String extension    = originalName != null && originalName.contains(".")
                    ? originalName.substring(originalName.lastIndexOf("."))
                    : ".jpg";
            String fileName = UUID.randomUUID() + extension;

            Path filePath = uploadPath.resolve(fileName);
            Files.copy(file.getInputStream(), filePath);

            return "/uploads/" + fileName;

        } catch (IOException e) {
            throw new BadRequestException("Không thể lưu file ảnh: " + e.getMessage());
        }
    }

    public void deleteImage(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;

        try {

            String fileName = imageUrl.replace("/uploads/", "");
            Path filePath   = Paths.get(uploadDir).resolve(fileName);

            Files.deleteIfExists(filePath);
        } catch (IOException e) {

        }
    }
}
