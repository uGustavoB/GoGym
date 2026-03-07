package com.ugustavob.gogym.application.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequestDTO(
        @Email(message = "E-mail Inválido.")
        @NotBlank(message = "É obrigatório preencher o e-mail.")
        @Schema(description = "E-mail do usuário", example = "admin@gmail.com", requiredMode = Schema.RequiredMode.REQUIRED)
        String email,
        @NotBlank(message = "É obrigatório preencher a senha.")
        String password
) {
}
