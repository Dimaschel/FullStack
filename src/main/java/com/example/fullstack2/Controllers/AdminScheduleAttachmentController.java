package com.example.fullstack2.Controllers;

import com.example.fullstack2.DTO.PresignedUrlResponseDTO;
import com.example.fullstack2.DTO.ScheduleAttachmentResponseDTO;
import com.example.fullstack2.Service.ScheduleAttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/admin/schedules")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminScheduleAttachmentController {
    private final ScheduleAttachmentService scheduleAttachmentService;

    @GetMapping("/{scheduleId}/attachments")
    public List<ScheduleAttachmentResponseDTO> getAttachments(@PathVariable Long scheduleId) {
        return scheduleAttachmentService.getByScheduleId(scheduleId);
    }

    @PostMapping("/{scheduleId}/attachments")
    @ResponseStatus(HttpStatus.CREATED)
    public ScheduleAttachmentResponseDTO uploadAttachment(@PathVariable Long scheduleId, @RequestParam("file") MultipartFile file) {
        return scheduleAttachmentService.upload(scheduleId, file);
    }

    @GetMapping("/attachments/{attachmentId}/download-url")
    public PresignedUrlResponseDTO getDownloadUrl(@PathVariable Long attachmentId) {
        return scheduleAttachmentService.getDownloadUrl(attachmentId);
    }

    @DeleteMapping("/attachments/{attachmentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAttachment(@PathVariable Long attachmentId) {
        scheduleAttachmentService.delete(attachmentId);
    }
}
