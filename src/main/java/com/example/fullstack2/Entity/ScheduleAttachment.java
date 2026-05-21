package com.example.fullstack2.Entity;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Date;

@Data
@Entity
@Table(name = "schedule_attachments")
public class ScheduleAttachment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "schedule_id", nullable = false)
    private Schedule schedule;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false, unique = true)
    private String objectKey;

    @Column(nullable = false)
    private String contentType;

    @Column(nullable = false)
    private long size;

    @Temporal(TemporalType.TIMESTAMP)
    @Column(nullable = false)
    private Date uploadedAt = new Date();
}
