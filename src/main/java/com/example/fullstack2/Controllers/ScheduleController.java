package com.example.fullstack2.Controllers;

import com.example.fullstack2.DTO.SchedulePageResponseDTO;
import com.example.fullstack2.DTO.ScheduleResponseDTO;
import com.example.fullstack2.Entity.ScheduleStatus;
import com.example.fullstack2.Service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;

import java.util.List;

@RestController
@RequestMapping("/Schedule")
@RequiredArgsConstructor
@Validated
public class ScheduleController {
    private final ScheduleService scheduleService;

    @GetMapping("/getAllSchedule")
    public ResponseEntity<SchedulePageResponseDTO> getAllSchedules(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) ScheduleStatus status,
            @RequestParam(defaultValue = "nearest")
            @Pattern(regexp = "nearest|farthest", message = "timeOrder must be nearest or farthest")
            String timeOrder,
            @RequestParam(defaultValue = "0")
            @Min(value = 0, message = "page must be >= 0")
            int page,
            @RequestParam(defaultValue = "6")
            @Min(value = 1, message = "size must be >= 1")
            @Max(value = 50, message = "size must be <= 50")
            int size
    ) {
        SchedulePageResponseDTO res = scheduleService.getSchedules(search, status, timeOrder, page, size);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<ScheduleResponseDTO> getScheduleById(@PathVariable Long id){
        ScheduleResponseDTO schedule = scheduleService.getSchedule(id);

        return ResponseEntity.ok(schedule);

    }

    @PostMapping("/updateStatus")
    public String updateStatus(@RequestBody Long id, @RequestBody ScheduleStatus status){
        scheduleService.setStatus(id, status);
        return "Status updated";
    }
}
