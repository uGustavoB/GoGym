package com.ugustavob.gogym.application.musclegroup.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

public record CreateMuscleGroupRequestDTO(
        @NotBlank(message = "É obrigatório preencher o nome do grupo muscular.")
        @Schema(description = "Nome do grupo muscular", example = "Peito", requiredMode = Schema.RequiredMode.REQUIRED)
        String name
) {
}
