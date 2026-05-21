package com.example.fullstack2;

import com.example.fullstack2.config.SeoProperties;
import com.example.fullstack2.config.WeatherProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties({SeoProperties.class, WeatherProperties.class})
public class Fullstack2Application {

	public static void main(String[] args) {
		SpringApplication.run(Fullstack2Application.class, args);
	}

}
