package com.example.fullstack2.DTO;

import com.example.fullstack2.Entity.UserType;
import lombok.Data;

@Data
public class SignupRequest {
    private String email;
    private String number;
    private UserType userType;
    private String password;
}