package com.example.fullstack2.Service;

import com.example.fullstack2.DTO.WeatherResponseDTO;
import com.example.fullstack2.config.WeatherProperties;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class WeatherService {
    private final WeatherProperties weatherProperties;
    private final ObjectMapper objectMapper;
    private final ConcurrentHashMap<String, CachedWeather> cache = new ConcurrentHashMap<>();

    public Optional<WeatherResponseDTO> getCurrentWeather(String city) {
        if (!weatherProperties.isEnabled()) {
            return Optional.empty();
        }

        String normalizedCity = normalizeCity(city);
        CachedWeather cachedWeather = cache.get(normalizedCity);
        Instant now = Instant.now();

        if (cachedWeather != null && cachedWeather.isFresh(now, weatherProperties.getCacheMinutes())) {
            return Optional.of(cachedWeather.weather());
        }

        if (cachedWeather != null && cachedWeather.isWithinThrottleWindow(now, weatherProperties.getMinRequestIntervalSeconds())) {
            return Optional.of(cachedWeather.weather());
        }

        WeatherResponseDTO weather = fetchWithRetry(normalizedCity);
        cache.put(normalizedCity, new CachedWeather(weather, now));
        return Optional.of(weather);
    }

    private WeatherResponseDTO fetchWithRetry(String city) {
        RuntimeException lastException = null;

        for (int attempt = 1; attempt <= weatherProperties.getMaxRetries(); attempt++) {
            try {
                return fetchWeather(city);
            } catch (RuntimeException exception) {
                lastException = exception;
            }
        }

        throw new ResponseStatusException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "Внешний погодный сервис временно недоступен",
                lastException
        );
    }

    private WeatherResponseDTO fetchWeather(String city) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(weatherProperties.getTimeoutSeconds()))
                    .build();

            String endpoint = weatherProperties.getBaseUrl()
                    + "?latitude=55.7558&longitude=37.6173"
                    + "&daily=temperature_2m_mean,temperature_2m_min,temperature_2m_max"
                    + "&timezone=Europe/Moscow&forecast_days=1";

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(weatherProperties.getTimeoutSeconds()))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 404) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Город не найден во внешнем погодном сервисе");
            }

            if (response.statusCode() >= 400) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Внешний погодный сервис вернул ошибку");
            }

            return normalizeResponse(objectMapper.readTree(response.body()), city);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Ошибка чтения ответа внешнего сервиса", exception);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Запрос к внешнему погодному сервису был прерван", exception);
        }
    }

    private WeatherResponseDTO normalizeResponse(JsonNode root, String city) {
        JsonNode dailyNode = root.path("daily");
        String date = dailyNode.path("time").isArray() && dailyNode.path("time").size() > 0
                ? dailyNode.path("time").get(0).asText()
                : "";
        double averageTemperature = dailyNode.path("temperature_2m_mean").isArray() && dailyNode.path("temperature_2m_mean").size() > 0
                ? dailyNode.path("temperature_2m_mean").get(0).asDouble()
                : 0.0;
        double minTemperature = dailyNode.path("temperature_2m_min").isArray() && dailyNode.path("temperature_2m_min").size() > 0
                ? dailyNode.path("temperature_2m_min").get(0).asDouble()
                : 0.0;
        double maxTemperature = dailyNode.path("temperature_2m_max").isArray() && dailyNode.path("temperature_2m_max").size() > 0
                ? dailyNode.path("temperature_2m_max").get(0).asDouble()
                : 0.0;

        return new WeatherResponseDTO(
                cityLabel(city),
                date,
                "Средняя температура на сегодня",
                averageTemperature,
                minTemperature,
                maxTemperature,
                "Open-Meteo"
        );
    }

    private String normalizeCity(String city) {
        return StringUtils.hasText(city) ? city.trim() : weatherProperties.getDefaultCity();
    }

    private String cityLabel(String city) {
        return StringUtils.hasText(city) ? city : "Москва";
    }

    private record CachedWeather(WeatherResponseDTO weather, Instant fetchedAt) {
        private boolean isFresh(Instant now, int cacheMinutes) {
            return fetchedAt.plus(Duration.ofMinutes(cacheMinutes)).isAfter(now);
        }

        private boolean isWithinThrottleWindow(Instant now, int minRequestIntervalSeconds) {
            return fetchedAt.plusSeconds(minRequestIntervalSeconds).isAfter(now);
        }
    }
}
