package com.example.fullstack2.Service;

import com.example.fullstack2.DTO.InformationDTO;
import com.example.fullstack2.DTO.InformationResponseDTO;
import com.example.fullstack2.Entity.Information;
import com.example.fullstack2.Entity.User;
import com.example.fullstack2.DTO.InformationMapper;
import com.example.fullstack2.Repository.InformationRepository;
import com.example.fullstack2.Repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class InformationService {

    private final InformationRepository informationRepository;
    private final UserRepository userRepository;
    private final InformationMapper informationMapper;

    public InformationResponseDTO createInformation(InformationDTO requestDTO) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        User curUser = (User) auth.getPrincipal();
        requestDTO.setUserId(curUser.getId());

        if (informationRepository.existsById(curUser.getId())) {
            throw new RuntimeException("Information already exists for this user");
        }

        Information information = informationMapper.toEntity(requestDTO);
        information.setUser(curUser);

        Information saved = informationRepository.save(information);
        return informationMapper.toResponseDTO(saved);
    }


    public InformationResponseDTO getInformationByUserId(Long userId) {
        Information information = informationRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Information not found for user id: " + userId));
        return informationMapper.toResponseDTO(information);
    }

    public List<InformationResponseDTO> getAllInformation() {
        return informationRepository.findAll().stream()
                .map(informationMapper::toResponseDTO)
                .collect(Collectors.toList());
    }


    public void deleteInformation(Long id) {
        if (!informationRepository.existsById(id)) {
            throw new RuntimeException("Information not found with id: " + id);
        }
        informationRepository.deleteById(id);
    }

    public InformationResponseDTO incrementHelpCount(Long userId) {
        Information information = informationRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Information not found for user id: " + userId));

        information.setCountHelps(information.getCountHelps() + 1);
        Information updated = informationRepository.save(information);
        return informationMapper.toResponseDTO(updated);
    }

}