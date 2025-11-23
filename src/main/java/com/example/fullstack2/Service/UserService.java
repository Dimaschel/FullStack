package com.example.fullstack2.Service;


import com.example.fullstack2.Entity.User;
import com.example.fullstack2.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;

    public String deleteUserByEmail(String email) {

        if(!userRepository.existsByEmail(email)) {
            throw new UsernameNotFoundException("User not found");
        }

        userRepository.deleteByEmail(email);
        return "User deleted successfully";
    }
    public String deleteById(String id) {
        if(!userRepository.existsById(Long.valueOf(id))) {
            throw new UsernameNotFoundException("User not found");
        }
        userRepository.deleteById(Long.valueOf(id));
        return "User deleted successfully";

    }
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден"));
    }

    public User getUserById(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new UsernameNotFoundException("Пользователь не найден"));
    }

}
