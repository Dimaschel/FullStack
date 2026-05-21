package com.example.fullstack2.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "weather.api")
public class WeatherProperties {
    private boolean enabled = true;
    private String baseUrl;
    private String defaultCity = "Москва";
    private int timeoutSeconds = 4;
    private int maxRetries = 2;
    private int cacheMinutes = 10;
    private int minRequestIntervalSeconds = 30;
}
