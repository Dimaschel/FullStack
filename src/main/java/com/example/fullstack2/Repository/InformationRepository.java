package com.example.fullstack2.Repository;

import com.example.fullstack2.Entity.Information;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InformationRepository extends JpaRepository<Information, Integer> {
}
