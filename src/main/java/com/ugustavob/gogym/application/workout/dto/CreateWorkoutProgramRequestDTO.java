package com.ugustavob.gogym.application.workout.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateWorkoutProgramRequestDTO(
        @NotBlank(message = "O nome do programa de treino é obrigatório")
        String name,
        String description,
        @NotNull(message = "O ID do usuário é obrigatório")
        Long userId,
        @NotEmpty(message = "A lista de treinos não pode estar vazia")
        List<CreateWorkoutRequestDTO> workouts
) {}