package com.example.fullstack2.Controllers;

import com.example.fullstack2.DTO.JwtResponse;
import com.example.fullstack2.DTO.LoginRequest;
import com.example.fullstack2.DTO.SignupRequest;
import com.example.fullstack2.Entity.User;
import com.example.fullstack2.Entity.UserDetailImpl;
import com.example.fullstack2.Repository.UserRepository;
import com.example.fullstack2.Security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final JwtUtils jwtUtils;
    private final UserDetailImpl userDetailImpl;
    private final PasswordEncoder encoder;
    private final UserRepository userRepository;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/signin")
    public ResponseEntity<?> authenticateUser(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateToken(authentication);

            User user = (User) authentication.getPrincipal();

            return ResponseEntity.ok(new JwtResponse(jwt, user.getEmail(), user.getUserType().name()));
        }
        catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already taken!");
        }

        if (userRepository.existsByNumber(signUpRequest.getNumber())) {
            return ResponseEntity.badRequest().body("Error: Phone number is already in use!");
        }

        if (signUpRequest.getUserType() == null) {
            return ResponseEntity.badRequest().body("Error: User type is required!");
        }

        try {
            User user = new User();
            user.setEmail(signUpRequest.getEmail());
            user.setNumber(signUpRequest.getNumber());
            user.setUserType(signUpRequest.getUserType());
            user.setPassword(encoder.encode(signUpRequest.getPassword()));

            userRepository.save(user);

            return ResponseEntity.ok("User registered successfully!");

        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error: Registration failed!");
        }
    }

}
