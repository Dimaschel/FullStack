package com.example.fullstack2.DTO;

import com.example.fullstack2.Entity.ScheduleStatus;
import lombok.Data;

import java.util.Date;

@Data
public class ScheduleResponseDTO {
    private Long id;
    private String task;
    private Date dateTime;
    private Integer rating;
    private ScheduleStatus status;
    private Long ownerId;
    private Long responderId;
    private String ownerName;
    private String responderName;
}
