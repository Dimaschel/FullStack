package com.example.fullstack2.Service;

import com.example.fullstack2.DTO.InformationDTO;
import com.example.fullstack2.DTO.InformationMapper;
import com.example.fullstack2.DTO.InformationResponseDTO;
import com.example.fullstack2.Entity.Information;
import com.example.fullstack2.Entity.User;
import com.example.fullstack2.Entity.UserType;
import com.example.fullstack2.Repository.InformationRepository;
import com.example.fullstack2.Repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class InformationServiceTest {
    @Mock
    private InformationRepository informationRepository;
    @Mock
    private UserRepository userRepository;

    private InformationService service;

    @BeforeEach
    void setUp() {
        service = new InformationService(informationRepository, userRepository, new InformationMapper());
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void createInformationShouldBindRecordToCurrentUser() {
        User currentUser = user(5L, "needy@test.local", UserType.NEEDY);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(currentUser, null, currentUser.getAuthorities()));
        when(informationRepository.existsById(5L)).thenReturn(false);
        when(informationRepository.save(any(Information.class))).thenAnswer(invocation -> {
            Information information = invocation.getArgument(0, Information.class);
            information.setId(100L);
            information.setCountHelps(0);
            return information;
        });

        InformationDTO request = new InformationDTO();
        request.setAge(72);
        request.setName("Иван");

        InformationResponseDTO response = service.createInformation(request);

        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getUserId()).isEqualTo(5L);
        assertThat(response.getAge()).isEqualTo(72);
        assertThat(response.getName()).isEqualTo("Иван");
    }

    @Test
    void createInformationShouldRejectDuplicateProfile() {
        User currentUser = user(5L, "needy@test.local", UserType.NEEDY);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(currentUser, null, currentUser.getAuthorities()));
        when(informationRepository.existsById(5L)).thenReturn(true);

        InformationDTO request = new InformationDTO();
        request.setAge(72);
        request.setName("Иван");

        assertThatThrownBy(() -> service.createInformation(request))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Information already exists for this user");
    }

    @Test
    void incrementHelpCountShouldIncreaseCounter() {
        Information information = information(5L, 3, "Иван", 2);
        when(informationRepository.findByUserId(5L)).thenReturn(Optional.of(information));
        when(informationRepository.save(any(Information.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InformationResponseDTO response = service.incrementHelpCount(5L);

        assertThat(response.getCountHelps()).isEqualTo(3);
        assertThat(information.getCountHelps()).isEqualTo(3);
    }

    @Test
    void updateInformationShouldChangeNameAndAgeForCurrentUser() {
        User currentUser = user(5L, "needy@test.local", UserType.NEEDY);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(currentUser, null, currentUser.getAuthorities()));
        Information information = information(5L, 70, "Старое имя", 1);
        when(informationRepository.findByUserId(5L)).thenReturn(Optional.of(information));
        when(informationRepository.save(any(Information.class))).thenAnswer(invocation -> invocation.getArgument(0));

        InformationDTO request = new InformationDTO();
        request.setAge(71);
        request.setName("Новое имя");

        InformationResponseDTO response = service.updateInformation(request);

        assertThat(response.getAge()).isEqualTo(71);
        assertThat(response.getName()).isEqualTo("Новое имя");
    }

    @Test
    void getMyInformationShouldReturnEmptyWhenProfileIsMissing() {
        User currentUser = user(5L, "needy@test.local", UserType.NEEDY);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(currentUser, null, currentUser.getAuthorities()));
        when(informationRepository.findByUserId(5L)).thenReturn(Optional.empty());

        assertThat(service.getMyInformation()).isEmpty();
    }

    private Information information(Long userId, int age, String name, int countHelps) {
        Information information = new Information();
        information.setId(10L);
        information.setAge(age);
        information.setName(name);
        information.setCountHelps(countHelps);
        information.setUser(user(userId, "user" + userId + "@test.local", UserType.NEEDY));
        return information;
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
