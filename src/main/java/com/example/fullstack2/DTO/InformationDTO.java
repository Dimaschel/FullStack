package com.example.fullstack2.DTO;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class InformationDTO {
    @NotNull
    @Min(value = 14)
    @Max(value = 130)
    private Integer age;

    @NotBlank
    private String name;

    @NotNull
    private Long userId;
}