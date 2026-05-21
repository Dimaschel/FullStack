package com.example.fullstack2.Service;

import com.example.fullstack2.DTO.ScheduleMapper;
import com.example.fullstack2.DTO.SchedulePageResponseDTO;
import com.example.fullstack2.Entity.Schedule;
import com.example.fullstack2.Entity.ScheduleAttachment;
import com.example.fullstack2.Entity.ScheduleStatus;
import com.example.fullstack2.Entity.User;
import com.example.fullstack2.Entity.UserType;
import com.example.fullstack2.Repository.ScheduleAttachmentRepository;
import com.example.fullstack2.Repository.ScheduleRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Date;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScheduleServiceTest {
    @Mock
    private ScheduleRepository scheduleRepository;
    @Mock
    private ScheduleAttachmentRepository scheduleAttachmentRepository;
    @Mock
    private InformationService informationService;

    private ScheduleService service;

    @BeforeEach
    void setUp() {
        service = new ScheduleService(scheduleRepository, scheduleAttachmentRepository, new ScheduleMapper(), informationService);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void setResponderShouldMoveOpenScheduleToInProgress() {
        User helper = user(10L, "helper@test.local", UserType.HELPER);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(helper, null, helper.getAuthorities()));

        Schedule schedule = schedule(1L, ScheduleStatus.OPEN);
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));

        service.setResponder(1L);

        assertThat(schedule.getResponder()).isEqualTo(helper);
        assertThat(schedule.getStatus()).isEqualTo(ScheduleStatus.IN_PROGRESS);
        verify(scheduleRepository).save(schedule);
    }

    @Test
    void setResponderShouldRejectClosedSchedule() {
        User helper = user(10L, "helper@test.local", UserType.HELPER);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(helper, null, helper.getAuthorities()));

        Schedule schedule = schedule(1L, ScheduleStatus.COMPLETED);
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));

        assertThatThrownBy(() -> service.setResponder(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Нельзя откликнуться на это расписание");
    }

    @Test
    void getSchedulesShouldIncludeAttachmentsForAdminRequests() {
        User admin = user(1L, "admin@test.local", UserType.ADMIN);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(admin, null, admin.getAuthorities()));

        Schedule schedule = schedule(5L, ScheduleStatus.OPEN);
        PageImpl<Schedule> page = new PageImpl<>(List.of(schedule), PageRequest.of(0, 6), 1);
        when(scheduleRepository.findAll(any(org.springframework.data.jpa.domain.Specification.class), any(org.springframework.data.domain.Pageable.class)))
                .thenReturn(page);
        when(scheduleAttachmentRepository.findByScheduleIdInOrderByUploadedAtDesc(anyList()))
                .thenReturn(List.of(attachment(schedule)));

        SchedulePageResponseDTO response = service.getSchedules("помощь", ScheduleStatus.OPEN, "nearest", 0, 6);

        assertThat(response.getContent()).hasSize(1);
        assertThat(response.getContent().get(0).getAttachments()).hasSize(1);
        assertThat(response.getContent().get(0).getAttachments().get(0).getFileName()).isEqualTo("doc.pdf");
    }

    @Test
    void cancelResponseShouldRejectAnotherHelpersResponse() {
        User currentHelper = user(10L, "helper@test.local", UserType.HELPER);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(currentHelper, null, currentHelper.getAuthorities()));

        Schedule schedule = schedule(1L, ScheduleStatus.IN_PROGRESS);
        schedule.setResponder(user(11L, "other-helper@test.local", UserType.HELPER));
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule));

        assertThatThrownBy(() -> service.cancelResponse(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Вы не откликались на это расписание");
    }

    private Schedule schedule(Long id, ScheduleStatus status) {
        Schedule schedule = new Schedule();
        schedule.setId(id);
        schedule.setTask("Помочь с покупками");
        schedule.setStatus(status);
        schedule.setDateTime(new Date(System.currentTimeMillis() + 60_000));
        schedule.setOwner(user(2L, "owner@test.local", UserType.NEEDY));
        return schedule;
    }

    private ScheduleAttachment attachment(Schedule schedule) {
        ScheduleAttachment attachment = new ScheduleAttachment();
        attachment.setId(33L);
        attachment.setSchedule(schedule);
        attachment.setFileName("doc.pdf");
        attachment.setContentType("application/pdf");
        attachment.setSize(321L);
        attachment.setUploadedAt(new Date());
        attachment.setObjectKey("5/doc.pdf");
        return attachment;
    }

    private User user(Long id, String email, UserType userType) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setNumber("+79990000000" + id);
        user.setPassword("secret");
        user.setUserType(userType);
        return user;
    }
}
