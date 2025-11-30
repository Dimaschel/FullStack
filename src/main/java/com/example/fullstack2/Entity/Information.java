package com.example.fullstack2.Entity;


import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "information")
public class Information {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer countHelps = 0;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
