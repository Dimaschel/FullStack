package com.example.fullstack2.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@Data
@ConfigurationProperties(prefix = "storage.s3")
public class S3StorageProperties {
    private String endpoint;
    private String region;
    private String accessKey;
    private String secretKey;
    private String bucket;
    private long maxFileSizeBytes;
    private List<String> allowedContentTypes = new ArrayList<>();
}
