package com.example.fullstack2.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "app.seo")
public class SeoProperties {
    private String baseUrl;
}
