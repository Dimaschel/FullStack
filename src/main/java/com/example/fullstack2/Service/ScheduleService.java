package com.example.fullstack2.Service;

import com.example.fullstack2.DTO.ScheduleDTO;
import com.example.fullstack2.DTO.ScheduleAttachmentResponseDTO;
import com.example.fullstack2.DTO.ScheduleMapper;
import com.example.fullstack2.DTO.SchedulePageResponseDTO;
import com.example.fullstack2.DTO.ScheduleResponseDTO;
import com.example.fullstack2.Entity.Schedule;
import com.example.fullstack2.Entity.ScheduleAttachment;
import com.example.fullstack2.Entity.ScheduleStatus;
import com.example.fullstack2.Entity.User;
import com.example.fullstack2.Entity.UserType;
import com.example.fullstack2.Repository.ScheduleAttachmentRepository;
import com.example.fullstack2.Repository.ScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;


import java.util.Date;
import java.util.Collections;
import java.util.Map;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class ScheduleService {
    private final ScheduleRepository scheduleRepository;
    private final ScheduleAttachmentRepository scheduleAttachmentRepository;
    private final ScheduleMapper scheduleMapper;
    private final InformationService informationService;


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

        if (schedule.getStatus() == ScheduleStatus.COMPLETED) {
            throw new RuntimeException("Нельзя отменить завершенное расписание");
        }

        schedule.setStatus(ScheduleStatus.CANCELLED);

        scheduleRepository.save(schedule);

        return "Успешно удалено";
    }

    public ScheduleResponseDTO getSchedule(Long id) {
        if (!scheduleRepository.existsById(id)) {
            throw new UsernameNotFoundException("Рассписание не найдено");
        }
        Optional<Schedule> response =  scheduleRepository.findById(id);
        ScheduleResponseDTO responseDTO =  scheduleMapper.toResponseDTO(response.orElse(null));

        return responseDTO;
    }

    public List<ScheduleResponseDTO> getAllSchedules() {
        List<Schedule> schedules = scheduleRepository.findAllWithRelations();

        List<ScheduleResponseDTO> responseDTOs = schedules.stream()
                .map(scheduleMapper::toResponseDTO)
                .collect(Collectors.toList());

        return responseDTOs;
    }

    public List<ScheduleResponseDTO> getAllSchedulesOnlyActive() {
        List<Schedule> schedules = scheduleRepository.findAllWithRelations();

        List<ScheduleResponseDTO> responseDTOs = schedules.stream()
                .filter(schedule -> schedule.getStatus() != ScheduleStatus.COMPLETED &&
                schedule.getStatus() != ScheduleStatus.CANCELLED)
                .map(scheduleMapper::toResponseDTO)
                .collect(Collectors.toList());

        return responseDTOs;
    }

    public SchedulePageResponseDTO getSchedules(String search, ScheduleStatus status, String timeOrder, int page, int size) {
        Specification<Schedule> spec = Specification.where(null);

        if (StringUtils.hasText(search)) {
            String normalizedSearch = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("task")), normalizedSearch));
        }

        if (status != null) {
            spec = spec.and((root, query, criteriaBuilder) ->
                    criteriaBuilder.equal(root.get("status"), status));
        }

        Sort.Direction direction = "farthest".equalsIgnoreCase(timeOrder)
                ? Sort.Direction.DESC
                : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, "dateTime"));

        Page<Schedule> schedulePage = scheduleRepository.findAll(spec, pageable);
        Map<Long, List<ScheduleAttachmentResponseDTO>> attachmentsByScheduleId = getAttachmentsByScheduleId(schedulePage.getContent());
        List<ScheduleResponseDTO> content = schedulePage.getContent().stream()
                .map(schedule -> scheduleMapper.toResponseDTO(
                        schedule,
                        attachmentsByScheduleId.getOrDefault(schedule.getId(), List.of())
                ))
                .toList();

        return new SchedulePageResponseDTO(
                content,
                schedulePage.getNumber(),
                schedulePage.getSize(),
                schedulePage.getTotalElements(),
                schedulePage.getTotalPages(),
                schedulePage.isFirst(),
                schedulePage.isLast()
        );
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

    @Scheduled(fixedRate = 60000)
    public void updateExpiredSchedules() {
        List<Schedule> schedules = scheduleRepository.findAll();
        Date now = new Date();

        for (Schedule schedule : schedules) {
            if (schedule.getDateTime().before(now) && (schedule.getStatus() == ScheduleStatus.OPEN || schedule.getStatus() == ScheduleStatus.IN_PROGRESS)) {
                if (schedule.getResponder() != null) {
                    schedule.setStatus(ScheduleStatus.COMPLETED);
                } else {
                    schedule.setStatus(ScheduleStatus.CANCELLED);
                }
                scheduleRepository.save(schedule);

                informationService.incrementHelpCount(schedule.getResponder().getId());

                informationService.incrementHelpCount(schedule.getOwner().getId());
            }
        }
    }

    private Map<Long, List<ScheduleAttachmentResponseDTO>> getAttachmentsByScheduleId(List<Schedule> schedules) {
        if (!isAdminRequest() || schedules.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Long> scheduleIds = schedules.stream()
                .map(Schedule::getId)
                .toList();

        return scheduleAttachmentRepository.findByScheduleIdInOrderByUploadedAtDesc(scheduleIds).stream()
                .collect(Collectors.groupingBy(
                        attachment -> attachment.getSchedule().getId(),
                        Collectors.mapping(this::toAttachmentDto, Collectors.toList())
                ));
    }

    private ScheduleAttachmentResponseDTO toAttachmentDto(ScheduleAttachment attachment) {
        return new ScheduleAttachmentResponseDTO(
                attachment.getId(),
                attachment.getSchedule().getId(),
                attachment.getFileName(),
                attachment.getContentType(),
                attachment.getSize(),
                attachment.getUploadedAt()
        );
    }

    private boolean isAdminRequest() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return auth != null && auth.getPrincipal() instanceof User user && user.getUserType() == UserType.ADMIN;
    }
}
