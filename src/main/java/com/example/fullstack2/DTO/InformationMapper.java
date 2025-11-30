package com.example.fullstack2.DTO;

import com.example.fullstack2.Entity.Information;
import com.example.fullstack2.Entity.User;
import org.springframework.stereotype.Component;

@Component
public class InformationMapper {

    public InformationResponseDTO toResponseDTO(Information information) {
        InformationResponseDTO dto = new InformationResponseDTO();
        dto.setId(information.getId());
        dto.setAge(information.getAge());
        dto.setName(information.getName());
        dto.setCountHelps(information.getCountHelps());
        dto.setUserId(information.getUser().getId());
        return dto;
    }

    public Information toEntity(InformationDTO requestDTO) {
        Information information = new Information();
        information.setAge(requestDTO.getAge());
        information.setName(requestDTO.getName());

        User user = new User();
        user.setId(requestDTO.getUserId());
        information.setUser(user);

        return information;
    }

}