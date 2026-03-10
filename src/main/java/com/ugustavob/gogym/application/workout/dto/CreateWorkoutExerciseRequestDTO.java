package com.ugustavob.gogym.application.workout.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import org.hibernate.validator.constraints.Length;

import java.util.List;

public record CreateWorkoutExerciseRequestDTO(
        @NotNull(message = "O ID do exercício é obrigatório")
        @Positive(message = "O ID do exercício deve ser um número positivo")
        Long exerciseId,
        @NotNull(message = "O índice de ordem é obrigatório")
        @Positive(message = "O índice de ordem deve ser um número positivo")
        Integer orderIndex,
        @Length(max = 500, message = "As notas não podem exceder 500 caracteres")
        String notes,
        @NotEmpty(message = "A lista de séries planejadas não pode estar vazia")
        List<CreatePlannedSetRequestDTO> plannedSets
) {}