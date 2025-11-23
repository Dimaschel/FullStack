package com.example.fullstack2.Controllers;

import com.example.fullstack2.DTO.ScheduleResponseDTO;
import com.example.fullstack2.Entity.Schedule;
import com.example.fullstack2.Entity.ScheduleStatus;
import com.example.fullstack2.Repository.ScheduleRepository;
import com.example.fullstack2.Service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/Schedule")
@RequiredArgsConstructor
public class ScheduleController {
    private final ScheduleService scheduleService;
    private final ScheduleRepository scheduleRepository;

    @GetMapping("/getAllSchedule")
    public ResponseEntity<List<Schedule>> getAllSchedules(){
        List<Schedule> response = scheduleRepository.findAll();
        return ResponseEntity.ok(response);
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
