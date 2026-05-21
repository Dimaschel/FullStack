package com.example.fullstack2.Repository;

import com.example.fullstack2.Entity.ScheduleAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScheduleAttachmentRepository extends JpaRepository<ScheduleAttachment, Long> {
    List<ScheduleAttachment> findByScheduleIdOrderByUploadedAtDesc(Long scheduleId);
    List<ScheduleAttachment> findByScheduleIdInOrderByUploadedAtDesc(List<Long> scheduleIds);
}
