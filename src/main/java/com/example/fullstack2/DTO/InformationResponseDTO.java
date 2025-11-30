package com.example.fullstack2.DTO;

import lombok.Data;

@Data
public class InformationResponseDTO {
    private Long id;
    private Integer age;
    private String name;
    private Integer countHelps;
    private Long userId;
}
