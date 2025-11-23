package com.example.fullstack2.DTO;

import com.example.fullstack2.Entity.Schedule;
import com.example.fullstack2.Entity.ScheduleStatus;
import com.example.fullstack2.Entity.User;
import org.springframework.stereotype.Component;

@Component
public class ScheduleMapper {

    public ScheduleResponseDTO toResponseDTO(Schedule schedule) {
        ScheduleResponseDTO dto = new ScheduleResponseDTO();
        dto.setId(schedule.getId());
        dto.setTask(schedule.getTask());
        dto.setDateTime(schedule.getDateTime());
        dto.setRating(schedule.getRating());
        dto.setStatus(schedule.getStatus());
        dto.setOwnerId(schedule.getOwner().getId());

        if (schedule.getResponder() != null) {
            dto.setResponderId(schedule.getResponder().getId());
            dto.setResponderName(schedule.getResponder().getEmail());
        }

        dto.setOwnerName(schedule.getOwner().getEmail());

        return dto;
    }

    public Schedule toEntity(ScheduleDTO requestDTO) {
        Schedule schedule = new Schedule();
        schedule.setTask(requestDTO.getTask());
        schedule.setDateTime(requestDTO.getDateTime());

        User owner = new User();
        owner.setId(requestDTO.getOwnerId());
        schedule.setOwner(owner);

        schedule.setStatus(ScheduleStatus.OPEN);

        return schedule;
    }
}
