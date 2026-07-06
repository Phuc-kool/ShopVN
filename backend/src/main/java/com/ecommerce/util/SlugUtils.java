package com.ecommerce.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class SlugUtils {

    private SlugUtils() {}

    public static String toSlug(String input) {
        if (input == null || input.isBlank()) return "";

        String slug = input.trim().toLowerCase();

        slug = Normalizer.normalize(slug, Normalizer.Form.NFD);

        slug = slug.replaceAll("đ", "d").replaceAll("Đ", "d");

        slug = Pattern.compile("\\p{InCombiningDiacriticalMarks}+")
                      .matcher(slug)
                      .replaceAll("");

        slug = slug.replaceAll("[^a-z0-9\\s-]", "")
                   .replaceAll("[\\s-]+", "-")
                   .replaceAll("^-|-$", "");

        return slug;
    }
}
