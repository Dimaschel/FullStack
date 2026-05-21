package com.example.fullstack2.Repository;

import com.example.fullstack2.Entity.Schedule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<Schedule, Long>, JpaSpecificationExecutor<Schedule> {
    @Query("SELECT s FROM Schedule s LEFT JOIN FETCH s.owner LEFT JOIN FETCH s.responder")
    List<Schedule> findAllWithRelations();

    @Override
    @EntityGraph(attributePaths = {"owner", "responder"})
    Page<Schedule> findAll(Specification<Schedule> spec, Pageable pageable);
}
