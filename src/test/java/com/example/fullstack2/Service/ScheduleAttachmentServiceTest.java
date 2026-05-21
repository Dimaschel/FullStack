package com.example.fullstack2.Service;

import com.example.fullstack2.DTO.ScheduleAttachmentResponseDTO;
import com.example.fullstack2.Entity.Schedule;
import com.example.fullstack2.Entity.User;
import com.example.fullstack2.Repository.ScheduleAttachmentRepository;
import com.example.fullstack2.Repository.ScheduleRepository;
import com.example.fullstack2.config.S3StorageProperties;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class ScheduleAttachmentServiceTest {
    @Mock
    private ScheduleAttachmentRepository attachmentRepository;
    @Mock
    private ScheduleRepository scheduleRepository;
    @Mock
    private S3Client s3Client;
    @Mock
    private S3Presigner s3Presigner;
    @Mock
    private S3StorageProperties storageProperties;

    @InjectMocks
    private ScheduleAttachmentService service;


    @Test
    void uploadShouldRejectUnsupportedContentType() {
        MockMultipartFile file = new MockMultipartFile("file", "notes.txt", "text/plain", "hello".getBytes());
        when(scheduleRepository.findById(1L)).thenReturn(Optional.of(schedule(1L)));
        when(storageProperties.getMaxFileSizeBytes()).thenReturn(5_000L);
        when(storageProperties.getAllowedContentTypes()).thenReturn(List.of("application/pdf", "image/png"));

        assertThatThrownBy(() -> service.upload(1L, file))
                .isInstanceOf(ResponseStatusException.class)
                .satisfies(exception -> {
                    ResponseStatusException responseException = (ResponseStatusException) exception;
                    assertThat(responseException.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
                    assertThat(responseException.getReason()).isEqualTo("Недопустимый тип файла");
                });
    }

    @Test
    void uploadShouldStoreMetadataAndSanitizeName() {
        MockMultipartFile file = new MockMultipartFile("file", "my report.pdf", "application/pdf", "content".getBytes());
        Schedule schedule = schedule(7L);
        when(scheduleRepository.findById(7L)).thenReturn(Optional.of(schedule));
        when(storageProperties.getBucket()).thenReturn("test-bucket");
        when(storageProperties.getMaxFileSizeBytes()).thenReturn(5_000L);
        when(storageProperties.getAllowedContentTypes()).thenReturn(List.of("application/pdf", "image/png"));
        when(attachmentRepository.save(any())).thenAnswer(invocation -> {
            var attachment = invocation.getArgument(0, com.example.fullstack2.Entity.ScheduleAttachment.class);
            attachment.setId(55L);
            return attachment;
        });

        ScheduleAttachmentResponseDTO response = service.upload(7L, file);

        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));

        assertThat(requestCaptor.getValue().bucket()).isEqualTo("test-bucket");
        assertThat(requestCaptor.getValue().contentType()).isEqualTo("application/pdf");
        assertThat(response.getId()).isEqualTo(55L);
        assertThat(response.getFileName()).isEqualTo("my_report.pdf");
        assertThat(response.getScheduleId()).isEqualTo(7L);
    }

    private Schedule schedule(Long id) {
        Schedule schedule = new Schedule();
        schedule.setId(id);
        User owner = new User();
        owner.setId(3L);
        owner.setEmail("owner@test.local");
        schedule.setOwner(owner);
        return schedule;
    }
}
