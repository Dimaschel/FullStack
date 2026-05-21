package com.example.fullstack2.Service;

import com.example.fullstack2.Entity.User;
import com.example.fullstack2.Entity.UserType;
import com.example.fullstack2.Repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {
    @Mock
    private UserRepository userRepository;

    private UserService service;

    @BeforeEach
    void setUp() {
        service = new UserService(userRepository);
    }

    @Test
    void getUserByEmailShouldReturnExistingUser() {
        User user = user(1L, "admin@test.local", UserType.ADMIN);
        when(userRepository.findByEmail("admin@test.local")).thenReturn(Optional.of(user));

        User response = service.getUserByEmail("admin@test.local");

        assertThat(response.getId()).isEqualTo(1L);
        assertThat(response.getUserType()).isEqualTo(UserType.ADMIN);
    }

    @Test
    void getUserByEmailShouldThrowWhenMissing() {
        when(userRepository.findByEmail("missing@test.local")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getUserByEmail("missing@test.local"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("Пользователь не найден");
    }

    @Test
    void deleteUserByEmailShouldDeleteExistingUser() {
        when(userRepository.existsByEmail("helper@test.local")).thenReturn(true);

        String result = service.deleteUserByEmail("helper@test.local");

        assertThat(result).isEqualTo("User deleted successfully");
        verify(userRepository).deleteByEmail("helper@test.local");
    }

    @Test
    void deleteByIdShouldRejectUnknownUser() {
        when(userRepository.existsById(99L)).thenReturn(false);

        assertThatThrownBy(() -> service.deleteById("99"))
                .isInstanceOf(UsernameNotFoundException.class)
                .hasMessage("User not found");
    }

    private User user(Long id, String email, UserType userType) {
        User user = new User();
        user.setId(id);
        user.setEmail(email);
        user.setNumber("+79990000000" + id);
        user.setPassword("secret");
        user.setUserType(userType);
        return user;
    }
}
