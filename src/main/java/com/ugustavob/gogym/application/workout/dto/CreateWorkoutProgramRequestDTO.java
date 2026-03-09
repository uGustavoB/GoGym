package com.ugustavob.gogym.application.workout.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public record CreateWorkoutProgramRequestDTO(
        @NotBlank String name,
        String description,
        @NotNull Long userId,
        @NotEmpty List<CreateWorkoutRequestDTO> workouts
) {}