package com.ugustavob.gogym.application.workout.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record UpdateWorkoutProgramDetailsRequestDTO(
        @NotNull(message = "O ID do programa de treino é obrigatório")
        @Positive(message = "O ID do programa de treino deve ser um número positivo")
        Long programId,
        @NotBlank(message = "O nome do programa de treino é obrigatório")
        String name,
        String description,
        Boolean isActive
) {}