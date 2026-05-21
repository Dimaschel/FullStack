package com.example.fullstack2.Service;

import com.example.fullstack2.DTO.PresignedUrlResponseDTO;
import com.example.fullstack2.DTO.ScheduleAttachmentResponseDTO;
import com.example.fullstack2.Entity.Schedule;
import com.example.fullstack2.Entity.ScheduleAttachment;
import com.example.fullstack2.Repository.ScheduleAttachmentRepository;
import com.example.fullstack2.Repository.ScheduleRepository;
import com.example.fullstack2.config.S3StorageProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ScheduleAttachmentService {
    private final ScheduleAttachmentRepository attachmentRepository;
    private final ScheduleRepository scheduleRepository;
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    private final S3StorageProperties storageProperties;

    public List<ScheduleAttachmentResponseDTO> getByScheduleId(Long scheduleId) {
        ensureScheduleExists(scheduleId);
        return attachmentRepository.findByScheduleIdOrderByUploadedAtDesc(scheduleId).stream()
                .map(this::toDto)
                .toList();
    }

    public ScheduleAttachmentResponseDTO upload(Long scheduleId, MultipartFile file) {
        Schedule schedule = ensureScheduleExists(scheduleId);
        validateFile(file);

        String objectKey = scheduleId + "/" + UUID.randomUUID() + "-" + sanitizeFileName(file.getOriginalFilename());

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(storageProperties.getBucket())
                .key(objectKey)
                .contentType(file.getContentType())
                .build();

        try {
            byte[] fileBytes = file.getBytes();
            uploadObject(putObjectRequest, fileBytes);
        } catch (IOException exception) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Не удалось загрузить файл", exception);
        }

        ScheduleAttachment attachment = new ScheduleAttachment();
        attachment.setSchedule(schedule);
        attachment.setFileName(sanitizeFileName(file.getOriginalFilename()));
        attachment.setObjectKey(objectKey);
        attachment.setContentType(file.getContentType());
        attachment.setSize(file.getSize());
        attachment.setUploadedAt(new Date());

        return toDto(attachmentRepository.save(attachment));
    }

    public PresignedUrlResponseDTO getDownloadUrl(Long attachmentId) {
        ScheduleAttachment attachment = getAttachment(attachmentId);

        GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                .bucket(storageProperties.getBucket())
                .key(attachment.getObjectKey())
                .responseContentDisposition("inline; filename=\"" + attachment.getFileName() + "\"")
                .build();

        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
                .signatureDuration(Duration.ofMinutes(15))
                .getObjectRequest(getObjectRequest)
                .build();

        String url = s3Presigner.presignGetObject(presignRequest).url().toString();
        return new PresignedUrlResponseDTO(url);
    }

    public void delete(Long attachmentId) {
        ScheduleAttachment attachment = getAttachment(attachmentId);

        s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(storageProperties.getBucket())
                .key(attachment.getObjectKey())
                .build());

        attachmentRepository.delete(attachment);
    }

    private Schedule ensureScheduleExists(Long scheduleId) {
        return scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Расписание не найдено"));
    }

    private ScheduleAttachment getAttachment(Long attachmentId) {
        return attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Файл не найден"));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Файл обязателен");
        }

        if (file.getSize() > storageProperties.getMaxFileSizeBytes()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Файл превышает допустимый размер");
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !storageProperties.getAllowedContentTypes().contains(contentType)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Недопустимый тип файла");
        }

        if (!StringUtils.hasText(file.getOriginalFilename())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Имя файла не найдено");
        }
    }

    private void uploadObject(PutObjectRequest putObjectRequest, byte[] fileBytes) {
        try {
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileBytes));
        } catch (NoSuchBucketException exception) {
            createBucketIfNeeded();
            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileBytes));
        } catch (S3Exception exception) {
            if (isMissingBucket(exception)) {
                createBucketIfNeeded();
                s3Client.putObject(putObjectRequest, RequestBody.fromBytes(fileBytes));
                return;
            }
            throw exception;
        }
    }

    private void createBucketIfNeeded() {
        try {
            s3Client.createBucket(CreateBucketRequest.builder().bucket(storageProperties.getBucket()).build());
        } catch (S3Exception exception) {
            if (!bucketAlreadyExists(exception)) {
                throw exception;
            }
        }
    }

    private boolean isMissingBucket(S3Exception exception) {
        String errorCode = exception.awsErrorDetails() == null ? null : exception.awsErrorDetails().errorCode();
        return exception.statusCode() == 404 || "NoSuchBucket".equals(errorCode);
    }

    private boolean bucketAlreadyExists(S3Exception exception) {
        String errorCode = exception.awsErrorDetails() == null ? null : exception.awsErrorDetails().errorCode();
        return "BucketAlreadyOwnedByYou".equals(errorCode) || "BucketAlreadyExists".equals(errorCode);
    }

    private String sanitizeFileName(String fileName) {
        return fileName.replaceAll("[^a-zA-Z0-9._-]", "_");
    }

    private ScheduleAttachmentResponseDTO toDto(ScheduleAttachment attachment) {
        return new ScheduleAttachmentResponseDTO(
                attachment.getId(),
                attachment.getSchedule().getId(),
                attachment.getFileName(),
                attachment.getContentType(),
                attachment.getSize(),
                attachment.getUploadedAt()
        );
    }
}
