package com.ugustavob.gogym.application.workout.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record CreateWorkoutRequestDTO(
        @NotBlank(message = " O nome do treino é obrigatório")
        String name,
        @NotNull(message = " O índice de ordem do treino é obrigatório")
        @Positive(message = " O índice de ordem do treino deve ser um número positivo")
        Integer orderIndex,
        @NotEmpty(message = " A lista de exercícios do treino não pode estar vazia")
        List<CreateWorkoutExerciseRequestDTO> exercises
) {}