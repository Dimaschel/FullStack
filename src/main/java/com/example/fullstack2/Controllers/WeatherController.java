package com.example.fullstack2.Controllers;

import com.example.fullstack2.DTO.WeatherResponseDTO;
import com.example.fullstack2.Service.WeatherService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("/integrations/weather")
@RequiredArgsConstructor
public class WeatherController {
    private final WeatherService weatherService;

    @GetMapping("/current")
    public ResponseEntity<WeatherResponseDTO> getCurrentWeather(@RequestParam(required = false) String city) {
        Optional<WeatherResponseDTO> weather = weatherService.getCurrentWeather(city);
        return weather.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.noContent().build());
    }
}
