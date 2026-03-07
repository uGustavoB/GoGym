package com.ugustavob.gogym.application.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Set;

@Data
@AllArgsConstructor
public class LoginResponseDTO {

    private String token;
    private String type;
    private UserResponse user;

    @Data
    @AllArgsConstructor
    public static class UserResponse {
        private Long id;
        private String name;
        private String email;
        private Set<String> roles;
    }
}