package com.example.fullstack2.DTO;
import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private String email;
    private String userType;

    public JwtResponse(String token, String email, String userType) {
        this.token = token;
        this.email = email;
        this.userType = userType;
    }
}