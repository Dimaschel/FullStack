package com.example.fullstack2.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Date;

@Data
@AllArgsConstructor
public class ScheduleAttachmentResponseDTO {
    private Long id;
    private Long scheduleId;
    private String fileName;
    private String contentType;
    private long size;
    private Date uploadedAt;
}
