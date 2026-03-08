package com.ugustavob.gogym.application.musclegroup.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateMuscleGroupRequestDTO(
        @NotNull(message = "O ID não pode ser nulo")
        @Positive(message = "O ID deve ser um número maior que zero")
        Long id,
        @NotBlank(message = "É obrigatório preencher o nome do grupo muscular.")
        @Schema(description = "Nome do grupo muscular", example = "Peito", requiredMode = Schema.RequiredMode.REQUIRED)
        String name
) {
}
