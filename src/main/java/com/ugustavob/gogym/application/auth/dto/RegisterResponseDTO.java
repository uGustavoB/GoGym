package com.ugustavob.gogym.application.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class RegisterResponseDTO {
    private Long id;
    private String name;
    private String email;
    private Set<String> roles;
}