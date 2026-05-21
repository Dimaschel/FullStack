package com.example.fullstack2.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class WeatherResponseDTO {
    private String city;
    private String date;
    private String description;
    private double averageTemperatureCelsius;
    private double minTemperatureCelsius;
    private double maxTemperatureCelsius;
    private String source;
}
