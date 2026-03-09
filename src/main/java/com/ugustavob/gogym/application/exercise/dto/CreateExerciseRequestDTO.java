package com.ugustavob.gogym.application.exercise.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public record CreateExerciseRequestDTO(
        @NotBlank(message = "O nome do exercício é obrigatório")
        String name,
        @NotNull(message = "O ID do grupo muscular é obrigatório")
        @Positive(message = "O ID do grupo muscular deve ser um número positivo")
        Long muscleGroupId,
        @NotNull(message = "O ID do equipamento é obrigatório")
        @Positive(message = "O ID do equipamento deve ser um número positivo")
        Long equipmentId
) {
}
