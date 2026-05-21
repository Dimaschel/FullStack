package com.example.fullstack2.DTO;
import lombok.Data;

@Data
public class JwtResponse {
    private String token;
    private String refreshToken;
    private String type = "Bearer";
    private String email;
    private String userType;
    private Long userId;

    public JwtResponse(String token, String refreshToken, String email, String userType, Long userId) {
        this.token = token;
        this.refreshToken = refreshToken;
        this.email = email;
        this.userType = userType;
        this.userId = userId;
    }
}
