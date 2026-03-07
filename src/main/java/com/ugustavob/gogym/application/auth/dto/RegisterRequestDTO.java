package com.ugustavob.gogym.application.auth.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequestDTO(
        @NotBlank(message = "É obrigatório preencher o nome.")
        @Schema(description = "Nome do usuário", example = "Jesse Pinkman", requiredMode = Schema.RequiredMode.REQUIRED)
        String name,
        @Email(message = "E-mail Inválido.")
        @NotBlank(message = "É obrigatório preencher o e-mail.")
        @Schema(description = "E-mail do usuário", example = "admin@gmail.com", requiredMode = Schema.RequiredMode.REQUIRED)
        String email,
        @NotBlank(message = "É obrigatório preencher a senha.")
        @Schema(description = "Senha do usuário", example = "12345678", requiredMode = Schema.RequiredMode.REQUIRED)
        String password
) {
}
