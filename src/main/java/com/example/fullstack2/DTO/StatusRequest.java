package com.example.fullstack2.DTO;

import com.example.fullstack2.Entity.ScheduleStatus;
import lombok.Data;

@Data
public class StatusRequest {
    Long id;
    ScheduleStatus status;
}
