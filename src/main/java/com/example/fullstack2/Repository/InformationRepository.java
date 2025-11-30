package com.example.fullstack2.Repository;

import com.example.fullstack2.Entity.Information;
import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface InformationRepository extends JpaRepository<Information, Long> {
    boolean existsById(@NotNull Long userId);
    Optional<Information> findByUserId(Long userId);
}
