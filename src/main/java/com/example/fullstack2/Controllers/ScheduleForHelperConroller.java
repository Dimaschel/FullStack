package com.example.fullstack2.Controllers;

import com.example.fullstack2.Entity.ScheduleStatus;
import com.example.fullstack2.Service.ScheduleService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@PreAuthorize("hasRole('HELPER')")
@RequestMapping("/helper")
@RequiredArgsConstructor
public class ScheduleForHelperConroller {
    private final ScheduleService scheduleService;

    @PatchMapping(("/respond/{id}"))
    public String respondOnPost(@PathVariable Long id) {
        scheduleService.setResponder(id);
        return "Вы откликнулись";
    }

    @PatchMapping("/cancelResponse/{id}")
    public String cancelBid(@PathVariable Long id) {
        scheduleService.cancelResponse(id);
        return "Вы отменили свою заявку на помощь";
    }

}
