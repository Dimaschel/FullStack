package com.example.fullstack2.Controllers;

import com.example.fullstack2.DTO.InformationDTO;
import com.example.fullstack2.DTO.InformationResponseDTO;
import com.example.fullstack2.Service.InformationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/information")
@RequiredArgsConstructor
public class InformationController {
    private final InformationService informationService;

    @PostMapping("/create")
    public ResponseEntity<InformationResponseDTO> createInformation(@RequestBody InformationDTO informationDTO) {
        InformationResponseDTO response = informationService.createInformation(informationDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<Optional<InformationResponseDTO>> getMyInformation() {
        Optional<InformationResponseDTO> response = informationService.getMyInformation();
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<InformationResponseDTO> updateInformation(@RequestBody InformationDTO informationDTO) {
        InformationResponseDTO response = informationService.updateInformation(informationDTO);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<InformationResponseDTO> getInformationByUserId(@PathVariable Long userId) {
        InformationResponseDTO response = informationService.getInformationByUserId(userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/all")
    public ResponseEntity<java.util.List<InformationResponseDTO>> getAllInformation() {
        java.util.List<InformationResponseDTO> response = informationService.getAllInformation();
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteInformation(@PathVariable Long id) {
        informationService.deleteInformation(id);
        return ResponseEntity.ok("Information deleted successfully");
    }
}

