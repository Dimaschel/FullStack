package com.example.fullstack2.Controllers;

import com.example.fullstack2.DTO.RatingRequest;
import com.example.fullstack2.DTO.ScheduleDTO;
import com.example.fullstack2.DTO.StatusRequest;
import com.example.fullstack2.Entity.ScheduleStatus;
import com.example.fullstack2.Service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;


@RestController
@PreAuthorize("hasRole('NEEDY')")
@RequestMapping("/needy")
@RequiredArgsConstructor
public class ScheduleForNeedyController {
    private final ScheduleService scheduleService;

    @PostMapping("/createSchedule")
    public String createSchedule(@RequestBody ScheduleDTO schedule){
        scheduleService.createSchedulePost(schedule);
        return "Schedule created";
    }

    @PostMapping("/changeScheduleDate")
    public String updateDate(@RequestBody Date dateTime, @RequestBody Long id ){
        scheduleService.changeScheduleDate(id, dateTime);
        return "Schedule changed";
    }

    @DeleteMapping("/deleteSchedule/{id}")
    public String deleteSchedule(@PathVariable Long id){
        scheduleService.deleteSchedulePost(id);
        return "Schedule deleted";
    }

    @PatchMapping("/setRating")
    public String updateRating(@RequestBody RatingRequest rating){
        Long id = rating.getId();
        int newRating = rating.getRating();
        scheduleService.setRating(id, newRating);
        return "Rating updated";
    }

    @PatchMapping("/setStatus")
    public String updateStatus(@RequestBody StatusRequest status){
        Long id = status.getId();
        ScheduleStatus newStatus = status.getStatus();
        scheduleService.setStatus(id, newStatus);
        return "Status updated";
    }

}
