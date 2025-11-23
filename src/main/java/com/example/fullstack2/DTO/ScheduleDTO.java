package com.example.fullstack2.DTO;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.Date;

@Data
public class ScheduleDTO {
    private Long id;
    @NotBlank
    private String task;
    @NotNull
    private Date dateTime;
    @NotNull
    private Long ownerId;
}