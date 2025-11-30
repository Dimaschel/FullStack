package com.example.fullstack2.Service;

import com.example.fullstack2.DTO.ScheduleDTO;
import com.example.fullstack2.DTO.ScheduleMapper;
import com.example.fullstack2.DTO.ScheduleResponseDTO;
import com.example.fullstack2.Entity.Schedule;
import com.example.fullstack2.Entity.ScheduleStatus;
import com.example.fullstack2.Entity.User;
import com.example.fullstack2.Repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.parameters.P;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Date;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final ScheduleMapper scheduleMapper;


    /// NEEDY
    public void createSchedulePost(ScheduleDTO scheduleDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User curUser = (User) auth.getPrincipal();
        scheduleDTO.setOwnerId(curUser.getId());

        Schedule scheduleEntity = scheduleMapper.toEntity(scheduleDTO);

        scheduleRepository.save(scheduleEntity);
    }

    public String deleteSchedulePost(Long id) {
        Schedule schedule = scheduleRepository.findById(id).orElseThrow(() -> new RuntimeException("Расписание не найдено"));

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User curUser = (User) auth.getPrincipal();

        if (!schedule.getOwner().getId().equals(curUser.getId())) {
            throw new RuntimeException("Только владелец может отменить расписание");
        }

        scheduleRepository.deleteById(id);
        return "Успешно удалено";
    }

    public ScheduleResponseDTO getSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new UsernameNotFoundException("Пользователь не найден");
        }
        Optional<Schedule> response =  scheduleRepository.findById(id);
        ScheduleResponseDTO responseDTO =  scheduleMapper.toResponseDTO(response.orElse(null));

        return responseDTO;
    }

    public void changeScheduleDate(Long id, Date dateTime ){
        Schedule schedule = scheduleRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("Не найден"));
        schedule.setDateTime(dateTime);
        scheduleRepository.save(schedule);
    }
    public void deleteSchedule(Long id) {
        if(!scheduleRepository.existsById(id)) {
            throw new UsernameNotFoundException("Не найдено");
        }
        scheduleRepository.deleteById(id);
    }

    public void setRating(Long id, int rating) {
        if (rating < 0 || rating > 5 ) {
            throw new RuntimeException("Поставьте рейтинг от 1 до 5");
        }

        Schedule schedule = scheduleRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("Не найден"));

        if (schedule.getStatus() != ScheduleStatus.COMPLETED) {
            throw new RuntimeException("Рейтинг можно поставить только после завершения работы");
        }
        schedule.setRating(rating);
        scheduleRepository.save(schedule);
    }

    public void setStatus(Long id, ScheduleStatus status) {
        Schedule schedule = scheduleRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("Не найден"));
        schedule.setStatus(status);
        scheduleRepository.save(schedule);
    }


    /// HELPER
    public void setResponder(Long scheduleId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User curUser = (User) auth.getPrincipal();

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Расписание не найдено"));

        if (schedule.getStatus() != ScheduleStatus.OPEN) {
            throw new RuntimeException("Нельзя откликнуться на это расписание. Текущий статус: " + schedule.getStatus());
        }

        if (schedule.getResponder() != null && schedule.getResponder().getId().equals(curUser.getId())) {
            throw new RuntimeException("Вы уже откликнулись на это расписание");
        }

        schedule.setResponder(curUser);
        schedule.setStatus(ScheduleStatus.IN_PROGRESS);
        scheduleRepository.save(schedule);
    }

    public void cancelResponse(Long scheduleId){
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User curUser = (User) auth.getPrincipal();

        Schedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Расписание не найдено"));

        if (schedule.getResponder() == null || !schedule.getResponder().getId().equals(curUser.getId())) {
            throw new RuntimeException("Вы не откликались на это расписание");
        }

        if (schedule.getStatus() == ScheduleStatus.COMPLETED) {
            throw new RuntimeException("Нельзя отменить отклик на завершенную работу");
        }

        schedule.setResponder(null);
        schedule.setStatus(ScheduleStatus.OPEN);
        scheduleRepository.save(schedule);

    }
}
