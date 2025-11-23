package com.example.fullstack2.Repository;

import com.example.fullstack2.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByNumber(String number);
    void deleteByEmail(String email);
}
