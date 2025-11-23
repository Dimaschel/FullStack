package com.example.fullstack2.Service;

import com.example.fullstack2.Entity.Schedule;
import com.example.fullstack2.Repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;

    public String createSchedulePost(Schedule schedule) {


    }
}
