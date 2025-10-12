package com.example.fullstack2.Repository;

import com.example.fullstack2.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, Long> {
}
